# 🎬 Subtitle studio by @sagar.parmar.x90

> AI-powered subtitle generation made simple and accessible for all creators

A minimalist web application that uses Google's Gemini AI to generate word-level subtitles with precise timestamps from audio files. Built for content creators, video editors, YouTubers, and accessibility professionals who need quick and accurate transcription.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178c6.svg)

## ✨ Features

- 🎙️ **Audio File Upload** - Drag & drop or click to upload MP3/WAV files
- 🌍 **Multi-Language Support** - Transcribe in 15+ languages including English, Hindi, Gujarati, Spanish, French, and more
- ⚡ **AI-Powered Transcription** - Leverages Google Gemini 2.5 Pro for high-accuracy transcription
- ⏱️ **Word-Level Timestamps** - Get precise start and end times for each word
- ✏️ **Inline Editor** - Edit transcribed words directly in the interface
- 🔤 **Text Romanization** - Convert non-English text to Roman script with one click
- 📥 **Multiple Export Formats** - Download as .srt, .txt, .csv, or .json
- 📄 **Transcript Export** - Generate clean transcripts for Gemini AI (`prtranscript` format)
- 🌙 **Dark Mode** - Easy on the eyes with automatic theme detection
- 🔓 **No Login Required** - Start using immediately, no account needed

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- A Google Gemini API key ([Get one here](https://aistudio.google.com/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gemini-subtitle-studio.git
   cd gemini-subtitle-studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:3000`

## 🎯 How It Works

1. **Upload** - Drop your MP3 or WAV file into the upload zone
2. **Select Language** - Choose the audio language from 15+ supported languages
3. **Generate** - Click "Generate Subtitles" and let Gemini AI work its magic
4. **Edit** - Review and edit the transcribed words with timestamps
5. **Romanize** (Optional) - Convert non-English text to Roman script for easier editing
6. **Export** - Download your subtitles in .srt, .txt, .csv, .json, or prtranscript format

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini 2.5 Pro API
- **Build Tool**: Vite
- **Deployment**: Google AI Studio / Vercel-ready

## 📁 Project Structure

```
gemini-subtitle-studio/
├── components/           # React components
│   ├── FileUpload.tsx
│   ├── LanguageSelector.tsx
│   ├── SubtitleEditor.tsx
│   └── icons/           # SVG icon components
├── services/
│   └── geminiService.ts # Gemini API integration
├── App.tsx              # Main app component
├── types.ts             # TypeScript type definitions
├── constants.ts         # Supported languages config
└── vite.config.ts       # Vite configuration
```

## 🌐 Supported Languages

English (US, UK, India) • Hindi • Gujarati • Spanish • French • German • Italian • Portuguese (Brazil) • Russian • Japanese • Korean • Chinese (Mandarin) • Arabic

## 📦 Export Formats

### SRT Format
Industry-standard subtitle format with timing information, perfect for video editing software and streaming platforms.

### TXT Format
Plain text transcription, ideal for documentation or further text processing.

### CSV Format
Spreadsheet-friendly format with columns for word, start time, and end time - great for analysis and data processing.

### JSON Format
Structured data format with complete word-level information including timestamps - perfect for developers and custom integrations.

### PRTranscript Format
Clean transcript format optimized for Gemini AI processing and analysis - ideal for feeding transcripts back into AI workflows.

## 🔧 Configuration

### Customizing Subtitle Line Breaks

The app automatically groups words into subtitle lines based on:
- Natural pauses in speech (>0.7 seconds)
- Maximum line length (42 characters)

You can adjust these parameters in `components/SubtitleEditor.tsx`:

```typescript
if (pause > 0.7 || currentLine.text.length > 42) {
  // Customize these values
}
```

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add your `GEMINI_API_KEY` in Environment Variables
4. Deploy!

### Deploy to Google AI Studio

This project is optimized for Google AI Studio deployment. Simply open your project in AI Studio and deploy directly.

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Google Gemini AI](https://ai.google.dev/)
- Inspired by the need for accessible, free subtitle generation tools
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)

## ❓ FAQ

### How accurate is the transcription?
The app uses Google Gemini 2.5 Pro, which provides high accuracy for clear audio. Results may vary based on audio quality, background noise, and accents.

### What's the maximum file size?
Currently limited by your browser's capabilities. For best results, use files under 25MB.

### Can I use this for commercial projects?
Yes! The tool is free to use for personal and commercial projects. Just make sure to comply with Google's API terms of service.

### What does the "Romanize" button do?
The Romanize feature uses Gemini AI to convert non-English text (like Hindi, Gujarati, Arabic) into Roman script (Latin alphabet). This makes it easier to edit and work with subtitles if you're more comfortable with Roman characters, or if you need subtitles in transliterated form.

### Which audio quality works best?
For optimal results:
- Clear, mono or stereo audio
- Sample rate: 16kHz or higher
- Minimal background noise
- Single speaker preferred

### Why did my transcription fail?
Common issues:
- Invalid API key
- Unsupported file format
- Poor audio quality
- Network connectivity issues
- API rate limits exceeded

### Can I process multiple files at once?
Currently, the app processes one file at a time. Batch processing is planned for future updates!

## 🐛 Troubleshooting

### "Missing API Key" Error
- Ensure your `.env.local` file exists in the root directory
- Verify the key is named `GEMINI_API_KEY`
- Restart your dev server after adding the key

### Upload Not Working
- Check file format (only MP3 and WAV supported)
- Try a smaller file size
- Clear browser cache and try again

### Transcription Takes Too Long
- Large files naturally take more time
- Check your internet connection
- Gemini API might be experiencing high traffic

### Dark Mode Not Saving
- Ensure your browser allows localStorage
- Check if you're in incognito/private mode
- Try a different browser

### Export Not Downloading
- Check browser download settings
- Disable popup blockers
- Ensure you have write permissions in the download folder

### Timestamps Seem Off
- This can happen with overlapping speech or music
- Try editing the timestamps manually in the editor
- Consider using cleaner audio with single speaker

### Need More Help?
1. Check the [GitHub Issues](https://github.com/yourusername/gemini-subtitle-studio/issues)
2. Search for similar problems
3. Create a new issue with:
   - Your browser and OS
   - Steps to reproduce
   - Screenshots if possible
   - Console error messages

## 📋 Changelog

### Version 1.0.0 (Current)
**Initial Release**
- ✅ Audio file upload (MP3/WAV)
- ✅ 15+ language support
- ✅ Word-level timestamp generation
- ✅ Inline subtitle editor
- ✅ Text romanization (convert to Roman script)
- ✅ Export to .srt, .txt, .csv, .json, prtranscript
- ✅ Dark mode support
- ✅ Responsive design
- ✅ No login required

## 📧 Contact

Have questions or suggestions? Feel free to open an issue or reach out!

---

<div align="center">
  Made with ❤️ for content creators everywhere
  <br>
  <sub>Powered by Google Gemini AI</sub>
</div>
