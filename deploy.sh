#!/bin/bash

# ARNOMA Deployment Script
# Deploys index.html and index.mobile.html to GoDaddy via FTP

echo "🚀 Starting ARNOMA Deployment..."

# FTP Configuration
read -p "Enter FTP Host (e.g., ftp.richyfesta.com): " FTP_HOST
read -p "Enter FTP Username: " FTP_USER
read -sp "Enter FTP Password: " FTP_PASS
echo ""
read -p "Enter Remote Directory (e.g., /public_html or /httpdocs): " REMOTE_DIR

# Files to upload
FILES_TO_UPLOAD=(
    "index.html"
    "index.mobile.html"
)

echo ""
echo "📦 Uploading files to $FTP_HOST..."

for file in "${FILES_TO_UPLOAD[@]}"; do
    if [ -f "$file" ]; then
        echo "  ⬆️  Uploading $file..."
        curl -T "$file" "ftp://$FTP_HOST$REMOTE_DIR/$file" --user "$FTP_USER:$FTP_PASS" --ssl -k
        if [ $? -eq 0 ]; then
            echo "  ✅ $file uploaded successfully"
        else
            echo "  ❌ Failed to upload $file"
        fi
    else
        echo "  ⚠️  $file not found"
    fi
done

echo ""
echo "✅ Deployment complete!"
echo "🌐 Check: https://www.richyfesta.com"
echo "🔄 You may need to clear browser cache (Cmd+Shift+R)"

