// src/services/webrtcService.js
// Real WebRTC service for video consultation
import apiService from './api';

const SIGNALING_SERVER_URL = import.meta.env.VITE_SIGNALING_SERVER_URL || 'ws://localhost:3001';
const TURN_SERVER_URL = import.meta.env.VITE_TURN_SERVER_URL || 'stun:stun.l.google.com:19302';
const TURN_SERVER_USERNAME = import.meta.env.VITE_TURN_SERVER_USERNAME;
const TURN_SERVER_PASSWORD = import.meta.env.VITE_TURN_SERVER_PASSWORD;

class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.signalingSocket = null;
    this.consultationId = null;
    this.isInitiator = false;
    this.connectionState = 'disconnected';
    
    // Event handlers
    this.onLocalStream = null;
    this.onRemoteStream = null;
    this.onConnectionStateChange = null;
    this.onError = null;
    this.onMessage = null;
    
    // Ice candidate queue for early candidates
    this.iceCandidatesQueue = [];
  }

  // Initialize WebRTC with STUN/TURN servers
  async initializePeerConnection() {
    try {
      const rtcConfig = {
        iceServers: [
          { urls: TURN_SERVER_URL }
        ]
      };

      // Add TURN server if credentials are provided
      if (TURN_SERVER_USERNAME && TURN_SERVER_PASSWORD) {
        rtcConfig.iceServers.push({
          urls: TURN_SERVER_URL,
          username: TURN_SERVER_USERNAME,
          credential: TURN_SERVER_PASSWORD
        });
      }

      this.peerConnection = new RTCPeerConnection(rtcConfig);

      // Set up peer connection event handlers
      this.setupPeerConnectionEventHandlers();

      console.log('WebRTC peer connection initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize peer connection:', error);
      this.handleError(error);
      return false;
    }
  }

  setupPeerConnectionEventHandlers() {
    if (!this.peerConnection) return;

    // Ice candidate event
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate');
        this.sendSignalingMessage({
          type: 'ice-candidate',
          candidate: event.candidate
        });
      }
    };

    // Remote stream event
    this.peerConnection.ontrack = (event) => {
      console.log('Received remote stream');
      this.remoteStream = event.streams[0];
      if (this.onRemoteStream) {
        this.onRemoteStream(this.remoteStream);
      }
    };

    // Connection state change
    this.peerConnection.oniceconnectionstatechange = () => {
      this.connectionState = this.peerConnection.iceConnectionState;
      console.log('ICE connection state:', this.connectionState);
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(this.connectionState);
      }
    };

    // Data channel (for text chat during video call)
    this.setupDataChannel();
  }

  setupDataChannel() {
    try {
      this.dataChannel = this.peerConnection.createDataChannel('messages', {
        ordered: true
      });

      this.dataChannel.onopen = () => {
        console.log('Data channel opened');
      };

      this.dataChannel.onmessage = (event) => {
        if (this.onMessage) {
          this.onMessage(JSON.parse(event.data));
        }
      };

      // Handle incoming data channel
      this.peerConnection.ondatachannel = (event) => {
        const channel = event.channel;
        channel.onmessage = (event) => {
          if (this.onMessage) {
            this.onMessage(JSON.parse(event.data));
          }
        };
      };
    } catch (error) {
      console.error('Failed to setup data channel:', error);
    }
  }

  // Connect to signaling server
  async connectSignalingServer(consultationId) {
    return new Promise((resolve, reject) => {
      try {
        this.consultationId = consultationId;
        this.signalingSocket = new WebSocket(`${SIGNALING_SERVER_URL}?consultationId=${consultationId}`);

        this.signalingSocket.onopen = () => {
          console.log('Connected to signaling server');
          resolve(true);
        };

        this.signalingSocket.onmessage = async (event) => {
          const message = JSON.parse(event.data);
          await this.handleSignalingMessage(message);
        };

        this.signalingSocket.onclose = () => {
          console.log('Signaling server connection closed');
        };

        this.signalingSocket.onerror = (error) => {
          console.error('Signaling server error:', error);
          reject(error);
        };

        // Timeout after 10 seconds
        setTimeout(() => {
          if (this.signalingSocket.readyState !== WebSocket.OPEN) {
            reject(new Error('Signaling server connection timeout'));
          }
        }, 10000);

      } catch (error) {
        reject(error);
      }
    });
  }

  // Handle signaling messages
  async handleSignalingMessage(message) {
    try {
      switch (message.type) {
        case 'offer':
          await this.handleOffer(message.offer);
          break;
        case 'answer':
          await this.handleAnswer(message.answer);
          break;
        case 'ice-candidate':
          await this.handleIceCandidate(message.candidate);
          break;
        case 'user-joined':
          console.log('User joined:', message.userId);
          break;
        case 'user-left':
          console.log('User left:', message.userId);
          this.handleUserLeft();
          break;
        case 'consultation-ended':
          console.log('Consultation ended by expert');
          this.endConsultation();
          break;
        default:
          console.log('Unknown signaling message:', message);
      }
    } catch (error) {
      console.error('Error handling signaling message:', error);
      this.handleError(error);
    }
  }

  // Start local media stream
  async startLocalStream(videoConstraints = true, audioConstraints = true) {
    try {
      const constraints = {
        video: videoConstraints ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
          facingMode: 'user'
        } : false,
        audio: audioConstraints ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Add tracks to peer connection
      if (this.peerConnection) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection.addTrack(track, this.localStream);
        });
      }

      if (this.onLocalStream) {
        this.onLocalStream(this.localStream);
      }

      console.log('Local stream started');
      return this.localStream;
    } catch (error) {
      console.error('Failed to start local stream:', error);
      this.handleError(error);
      throw error;
    }
  }

  // Create and send offer (initiator)
  async createOffer() {
    try {
      this.isInitiator = true;
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });

      await this.peerConnection.setLocalDescription(offer);
      
      this.sendSignalingMessage({
        type: 'offer',
        offer: offer
      });

      console.log('Offer created and sent');
    } catch (error) {
      console.error('Failed to create offer:', error);
      this.handleError(error);
    }
  }

  // Handle incoming offer and create answer
  async handleOffer(offer) {
    try {
      await this.peerConnection.setRemoteDescription(offer);
      
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      
      this.sendSignalingMessage({
        type: 'answer',
        answer: answer
      });

      // Process queued ICE candidates
      await this.processQueuedIceCandidates();

      console.log('Answer created and sent');
    } catch (error) {
      console.error('Failed to handle offer:', error);
      this.handleError(error);
    }
  }

  // Handle incoming answer
  async handleAnswer(answer) {
    try {
      await this.peerConnection.setRemoteDescription(answer);
      
      // Process queued ICE candidates
      await this.processQueuedIceCandidates();

      console.log('Answer received and processed');
    } catch (error) {
      console.error('Failed to handle answer:', error);
      this.handleError(error);
    }
  }

  // Handle ICE candidates
  async handleIceCandidate(candidate) {
    try {
      if (this.peerConnection.remoteDescription) {
        await this.peerConnection.addIceCandidate(candidate);
      } else {
        // Queue the candidate for later processing
        this.iceCandidatesQueue.push(candidate);
      }
    } catch (error) {
      console.error('Failed to handle ICE candidate:', error);
    }
  }

  // Process queued ICE candidates
  async processQueuedIceCandidates() {
    try {
      for (const candidate of this.iceCandidatesQueue) {
        await this.peerConnection.addIceCandidate(candidate);
      }
      this.iceCandidatesQueue = [];
    } catch (error) {
      console.error('Failed to process queued ICE candidates:', error);
    }
  }

  // Send message through signaling server
  sendSignalingMessage(message) {
    if (this.signalingSocket && this.signalingSocket.readyState === WebSocket.OPEN) {
      this.signalingSocket.send(JSON.stringify({
        ...message,
        consultationId: this.consultationId
      }));
    } else {
      console.error('Signaling socket not available');
    }
  }

  // Send chat message through data channel
  sendChatMessage(message) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(JSON.stringify({
        type: 'chat',
        message,
        timestamp: Date.now()
      }));
      return true;
    }
    return false;
  }

  // Toggle video track
  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }

  // Toggle audio track
  toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }

  // Handle user leaving
  handleUserLeft() {
    // Clean up remote stream
    this.remoteStream = null;
    if (this.onRemoteStream) {
      this.onRemoteStream(null);
    }
  }

  // End consultation
  async endConsultation() {
    try {
      // Notify backend
      if (this.consultationId) {
        await apiService.endConsultation(this.consultationId);
      }

      // Send end message to other peer
      this.sendSignalingMessage({
        type: 'consultation-ended'
      });

      // Clean up
      this.cleanup();
    } catch (error) {
      console.error('Error ending consultation:', error);
      this.cleanup();
    }
  }

  // Clean up resources
  cleanup() {
    // Stop local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Close data channel
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    // Close signaling socket
    if (this.signalingSocket) {
      this.signalingSocket.close();
      this.signalingSocket = null;
    }

    // Reset state
    this.remoteStream = null;
    this.connectionState = 'disconnected';
    this.consultationId = null;
    this.isInitiator = false;
    this.iceCandidatesQueue = [];

    console.log('WebRTC cleanup completed');
  }

  // Handle errors
  handleError(error) {
    console.error('WebRTC Error:', error);
    if (this.onError) {
      this.onError(error);
    }
  }

  // Get connection statistics
  async getConnectionStats() {
    if (!this.peerConnection) return null;

    try {
      const stats = await this.peerConnection.getStats();
      const report = {};
      
      stats.forEach((stat) => {
        if (stat.type === 'inbound-rtp' && stat.mediaType === 'video') {
          report.video = {
            bytesReceived: stat.bytesReceived,
            packetsReceived: stat.packetsReceived,
            packetsLost: stat.packetsLost
          };
        }
        if (stat.type === 'inbound-rtp' && stat.mediaType === 'audio') {
          report.audio = {
            bytesReceived: stat.bytesReceived,
            packetsReceived: stat.packetsReceived,
            packetsLost: stat.packetsLost
          };
        }
      });

      return report;
    } catch (error) {
      console.error('Failed to get connection stats:', error);
      return null;
    }
  }
}

// Export singleton instance
const webrtcService = new WebRTCService();
export default webrtcService;