#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Configuration (defaults if not in .env)
PI_USER="${PI_USER:-chris}"
PI_HOST="${PI_HOST:-raspberrypi.local}"
PI_PATH="${PI_PATH:-/workspace/bdc-chef-v2}"
PI_PASSWORD="${PI_PASSWORD:-}"
SERVICE_NAME="${SERVICE_NAME:-discord-bot}"

# Use sshpass if password is set, otherwise normal ssh/scp
if [ -n "$PI_PASSWORD" ]; then
  SCP_CMD="sshpass -p ${PI_PASSWORD} scp"
  SSH_CMD="sshpass -p ${PI_PASSWORD} ssh"
else
  SCP_CMD="scp"
  SSH_CMD="ssh"
fi

echo "🔨 Building..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi

echo "📦 Copying dist to Pi..."
${SCP_CMD} -r ./dist/* ${PI_USER}@${PI_HOST}:${PI_PATH}/dist/

if [ $? -ne 0 ]; then
  echo "❌ Failed to copy files!"
  exit 1
fi

echo "🔄 Restarting service..."
${SSH_CMD} ${PI_USER}@${PI_HOST} "echo ${PI_PASSWORD} | sudo -S systemctl restart ${SERVICE_NAME}"

if [ $? -ne 0 ]; then
  echo "❌ Failed to restart service!"
  exit 1
fi

echo "✅ Deployed successfully!"

