// backend/src/controllers/consultationController.js
const Consultation = require('../models/Consultation');
const User = require('../models/User');

// Book a consultation
exports.bookConsultation = async (req, res) => {
  try {
    const { 
      farmerId, 
      expertId, 
      consultationType, 
      scheduledDate, 
      duration, 
      topic,
      description 
    } = req.body;

    // Validate farmer and expert exist
    const farmer = await User.findById(farmerId);
    const expert = await User.findById(expertId);

    if (!farmer || !expert) {
      return res.status(404).json({
        success: false,
        message: 'Farmer or expert not found'
      });
    }

    // Check expert availability
    const conflictingConsultation = await Consultation.findOne({
      expertId,
      scheduledDate: new Date(scheduledDate),
      status: { $in: ['scheduled', 'ongoing'] }
    });

    if (conflictingConsultation) {
      return res.status(409).json({
        success: false,
        message: 'Expert is not available at the requested time'
      });
    }

    // Create consultation
    const consultation = new Consultation({
      farmerId,
      expertId,
      consultationType,
      scheduledDate: new Date(scheduledDate),
      duration: parseInt(duration),
      topic,
      description,
      status: 'scheduled',
      roomId: generateRoomId()
    });

    await consultation.save();

    // Send notifications to both parties
    await sendConsultationNotification(farmer, expert, consultation);

    res.status(201).json({
      success: true,
      message: 'Consultation booked successfully',
      data: consultation
    });

  } catch (error) {
    console.error('Book consultation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book consultation'
    });
  }
};

// Get consultations for user
exports.getUserConsultations = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, status, page = 1, limit = 10 } = req.query;

    let query = {};
    if (role === 'farmer') {
      query.farmerId = userId;
    } else if (role === 'expert') {
      query.expertId = userId;
    } else {
      query = { $or: [{ farmerId: userId }, { expertId: userId }] };
    }

    if (status) {
      query.status = status;
    }

    const consultations = await Consultation.find(query)
      .populate('farmerId', 'name email')
      .populate('expertId', 'name email expertise')
      .sort({ scheduledDate: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Consultation.countDocuments(query);

    res.json({
      success: true,
      data: {
        consultations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get consultations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get consultations'
    });
  }
};

// Get available experts
exports.getAvailableExperts = async (req, res) => {
  try {
    const { expertise, date, duration = 60 } = req.query;

    let query = { role: 'expert', isActive: true };
    
    if (expertise) {
      query.expertise = { $in: [expertise] };
    }

    const experts = await User.find(query)
      .select('name email expertise rating reviewCount availability profileImage');

    // Filter by availability if date is provided
    let availableExperts = experts;
    if (date) {
      availableExperts = await filterExpertsByAvailability(experts, date, duration);
    }

    res.json({
      success: true,
      data: availableExperts
    });

  } catch (error) {
    console.error('Get available experts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available experts'
    });
  }
};

// Start consultation
exports.startConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;
    
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    // Update consultation status
    consultation.status = 'ongoing';
    consultation.actualStartTime = new Date();
    await consultation.save();

    // Generate video call credentials (mock)
    const callCredentials = generateCallCredentials(consultation.roomId);

    res.json({
      success: true,
      message: 'Consultation started',
      data: {
        roomId: consultation.roomId,
        callCredentials,
        consultation
      }
    });

  } catch (error) {
    console.error('Start consultation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start consultation'
    });
  }
};

// End consultation
exports.endConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { notes, rating, feedback } = req.body;
    
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    // Update consultation
    consultation.status = 'completed';
    consultation.actualEndTime = new Date();
    consultation.notes = notes;
    consultation.rating = rating;
    consultation.feedback = feedback;
    
    // Calculate actual duration
    if (consultation.actualStartTime) {
      consultation.actualDuration = Math.round(
        (consultation.actualEndTime - consultation.actualStartTime) / (1000 * 60)
      );
    }

    await consultation.save();

    res.json({
      success: true,
      message: 'Consultation ended successfully',
      data: consultation
    });

  } catch (error) {
    console.error('End consultation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end consultation'
    });
  }
};

// Cancel consultation
exports.cancelConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { reason } = req.body;
    
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    // Check if consultation can be cancelled
    const now = new Date();
    const scheduledTime = new Date(consultation.scheduledDate);
    const timeDiff = scheduledTime - now;
    const hoursUntilConsultation = timeDiff / (1000 * 60 * 60);

    if (hoursUntilConsultation < 2) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel consultation less than 2 hours before scheduled time'
      });
    }

    consultation.status = 'cancelled';
    consultation.cancellationReason = reason;
    consultation.cancelledAt = new Date();
    await consultation.save();

    // Notify both parties
    await sendCancellationNotification(consultation);

    res.json({
      success: true,
      message: 'Consultation cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel consultation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel consultation'
    });
  }
};

// Helper functions
function generateRoomId() {
  return 'room_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateCallCredentials(roomId) {
  // Mock video call credentials - replace with actual video service integration
  return {
    token: 'mock_token_' + roomId,
    serverUrl: 'wss://video.example.com',
    stunServers: ['stun:stun.l.google.com:19302'],
    turnServers: []
  };
}

async function filterExpertsByAvailability(experts, date, duration) {
  // Mock availability filtering - implement actual logic
  return experts.filter(expert => {
    // Check if expert has any consultations at the requested time
    return Math.random() > 0.3; // 70% availability rate for demo
  });
}

async function sendConsultationNotification(farmer, expert, consultation) {
  // Mock notification sending
  console.log(`Consultation notification sent to ${farmer.name} and ${expert.name}`);
}

async function sendCancellationNotification(consultation) {
  // Mock cancellation notification
  console.log(`Cancellation notification sent for consultation ${consultation._id}`);
}
