from gevent.pywsgi import WSGIServer
from app import app, socketio

# Run the server with Gevent
if __name__ == "__main__":
    # Wrap the app with SocketIO to support WebSockets
    socketio.init_app(app)
    
    # Create and start the WSGI server
    http_server = WSGIServer(('0.0.0.0', 8080), app)
    http_server.serve_forever()
