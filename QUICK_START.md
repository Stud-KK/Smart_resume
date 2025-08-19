# 🚀 Quick Start Guide - Smart AI Resume Maker

## ⚡ Get Running in 5 Minutes

### 1. **Prerequisites Check**
- ✅ Node.js 16+ installed
- ✅ Modern browser (Chrome/Edge recommended)
- ✅ Microphone access (for voice features)

### 2. **Install & Run**
```bash
# Clone or download the project
cd smart-resume-maker

# Install all dependencies (backend + frontend)
npm run install-all

# Start the application
npm run dev
```

### 3. **Access the App**
- 🌐 **Frontend**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:5000
- 💚 **Health Check**: http://localhost:5000/api/health

---

## 🎯 First-Time Setup

### **Windows Users**
```bash
# Double-click the start.bat file
# OR run manually:
npm run install-all
npm run dev
```

### **Mac/Linux Users**
```bash
# Install dependencies
npm run install-all

# Start development servers
npm run dev
```

---

## 🔧 Quick Configuration

### **Environment Variables** (Optional)
Create `.env` file in root directory:
```env
PORT=5000
NODE_ENV=development
OPENAI_API_KEY=your_key_here  # Optional
```

### **Voice Settings**
1. Open the app in your browser
2. Click the speaker icon to enable voice
3. Allow microphone access when prompted
4. Test voice input/output

---

## 🧪 Test the Features

### **1. Basic Conversation**
- Type: "I work in construction"
- Watch AI ask follow-up questions
- See resume building in real-time

### **2. Voice Interaction**
- Click microphone button
- Speak: "I was a delivery driver for 3 years"
- Listen to AI response

### **3. Resume Generation**
- Complete the conversation
- View resume preview
- Download PDF/DOCX

---

## 🚨 Troubleshooting

### **Common Issues**

#### **Port Already in Use**
```bash
# Kill process on port 5000
npx kill-port 5000
# OR change port in .env
PORT=5001
```

#### **Voice Not Working**
- Check browser permissions
- Use Chrome/Edge browser
- Ensure microphone is connected
- Check system audio settings

#### **Dependencies Error**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### **Frontend Build Issues**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

---

## 📱 Browser Compatibility

### **Full Voice Support**
- ✅ Chrome 88+
- ✅ Edge 88+
- ✅ Safari 14.1+

### **Limited Voice Support**
- ⚠️ Firefox (basic TTS only)
- ⚠️ Older browsers

### **No Voice Support**
- ❌ Internet Explorer
- ❌ Very old browsers

---

## 🔍 Development Commands

```bash
# Development mode (both servers)
npm run dev

# Backend only
npm run server

# Frontend only
npm run client

# Production build
npm run build

# Start production
npm start
```

---

## 📊 Health Checks

### **Backend Status**
```bash
curl http://localhost:5000/api/health
```

### **Frontend Status**
- Open http://localhost:3000
- Check browser console for errors

### **API Endpoints**
- Chat: http://localhost:5000/api/chat
- Resume: http://localhost:5000/api/generate-resume

---

## 🎉 Success Indicators

### **✅ Application Running**
- Frontend loads without errors
- Backend API responds to health check
- Voice features work in supported browsers
- Resume generation produces files

### **✅ Features Working**
- AI conversation flows naturally
- Voice input/output functions
- Resume preview updates in real-time
- PDF/DOCX export works

---

## 🆘 Need Help?

### **Quick Fixes**
1. **Restart the application**: `Ctrl+C` then `npm run dev`
2. **Clear browser cache**: Hard refresh `Ctrl+Shift+R`
3. **Check console errors**: Browser DevTools → Console
4. **Verify ports**: Ensure 3000 and 5000 are free

### **Common Solutions**
- **Voice issues**: Use Chrome/Edge, check permissions
- **Build errors**: Clear node_modules, reinstall
- **Port conflicts**: Change ports in .env file
- **API errors**: Check backend logs in terminal

---

## 🚀 Next Steps

### **After Getting It Running**
1. **Test all features** thoroughly
2. **Create a sample resume** to verify output
3. **Try different work scenarios** (construction, delivery, factory)
4. **Test voice features** in different browsers
5. **Generate PDF/DOCX** files

### **Ready for Production?**
- Set `NODE_ENV=production`
- Configure proper CORS origins
- Set up environment variables
- Test with real users

---

*🎯 **Goal**: Get the Smart AI Resume Maker running quickly so you can experience its powerful features for blue-collar workers!*
