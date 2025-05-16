#!/bin/bash

echo "Starting CUET Practice Test Server..."

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Change to the script's directory (where index.html etc. are)
cd "$SCRIPT_DIR" || exit

# Start the Python 3 server in the background on port 8000
# It will serve files from the current directory ($SCRIPT_DIR)
python3 -m http.server 8000 &

# Get the Process ID (PID) of the server
SERVER_PID=$!

echo "Server started in the background (PID: $SERVER_PID)."
sleep 1 # Wait 1 second

echo "------------------------------------------------------"
echo "Server is running."
echo "Open your web browser on Windows and go to:"
echo "  http://localhost:8000/index.html"
echo "------------------------------------------------------"
echo "To stop the server later, open a new WSL terminal and run:"
echo "  kill $SERVER_PID"
echo "Or find this terminal and press Ctrl+C, then type 'kill $SERVER_PID' if needed."
echo "Press Ctrl+C to exit this script message (server keeps running)."

# Wait for the server process to end or script to be interrupted
wait $SERVER_PID
