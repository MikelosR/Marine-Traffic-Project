#!/bin/bash
echo "🚀 Starting SeaX Maritime Surveillance Platform..."

docker-compose down --remove-orphans
docker-compose up -d    #NO --build flag!

echo "⏳ Waiting for services to start..."
sleep 14

echo "🌐 Opening browser..."
# Mac-specific browser opening
if command -v open >/dev/null 2>&1; then
    open http://localhost:3000
else
    echo "❌ Unable to open browser automatically. Please open http://localhost:3000 manually"
fi

echo "✅ All services started!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8080"

# Follow logs
docker-compose logs -f