#!/bin/bash
# Deployment Script

echo "🚀 Starting deployment process..."

# Update API URLs in all files
find ./client/src -name "*.jsx" -type f -exec sed -i 's|http://localhost:5000|https://your-backend-url.railway.app|g' {} \;

echo "✅ API URLs updated"

# Build frontend
cd client
npm run build

echo "✅ Frontend built successfully"
echo "🎉 Ready for deployment!"