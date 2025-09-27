# backend/README.md

# Smart Crop Advisory System - Backend

A comprehensive Node.js backend API for the Smart Crop Advisory System that provides AI-powered farming assistance, weather insights, market intelligence, pest detection, and IoT irrigation management.

## Features

### 🌾 Core Agricultural Services
- **Personalized Crop Advisory** - AI-driven recommendations based on crop type, growth stage, and local conditions
- **Weather Intelligence** - Real-time weather data with farming-specific insights and alerts
- **Market Intelligence** - Live commodity prices, trends, and optimal selling recommendations
- **Pest & Disease Detection** - AI-powered image recognition for pest identification and treatment advice

### 🚿 Smart Irrigation Management
- **IoT Integration** - Real-time soil moisture monitoring and automated irrigation control
- **Water Usage Analytics** - Detailed tracking and optimization recommendations
- **Device Management** - Remote monitoring and control of irrigation devices

### 👨‍🌾 Expert Consultation Platform
- **Video Consultations** - Real-time video calls with agricultural experts
- **Appointment Scheduling** - Easy booking and management system
- **Expert Network** - Verified agricultural professionals with specialized expertise

### 🤖 AI-Powered Assistance
- **Multilingual Chatbot** - 24/7 support in multiple Indian languages
- **Voice Input Support** - Speech-to-text processing for farmer queries
- **Contextual Responses** - Personalized advice based on user profile and farm data

### 📱 Communication & Alerts
- **Push Notifications** - Firebase FCM integration for mobile alerts
- **SMS & Email** - Multi-channel notification system
- **Weather Alerts** - Critical weather warnings and farming advisories

## Technology Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer with image processing
- **Real-time**: Socket.io for live updates
- **External APIs**: OpenWeatherMap, Government Market APIs
- **Notifications**: Firebase Admin SDK, Twilio, Nodemailer
- **Security**: Helmet, CORS, Rate Limiting
- **Monitoring**: Morgan logging, Health checks

## Installation & Setup

### Prerequisites
- Node.js 16.0.0 or higher
- npm 8.0.0 or higher
- MongoDB 5.0 or higher
- Git

### Step 1: Clone Repository
