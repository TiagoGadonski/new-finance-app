#!/usr/bin/env python3
"""
Simple HTTP Server para o Frontend do FinanceApp
Execute: python server.py
"""

import http.server
import socketserver
import os

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

if __name__ == '__main__':
    os.chdir(DIRECTORY)

    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"""
====================================================
     FinanceApp Frontend Server
====================================================

  Servidor rodando em:
     http://localhost:{PORT}

  Credenciais Demo:
     Email: demo@financeapp.com
     Senha: Demo@123

  Para parar: Ctrl + C

====================================================
        """)

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\nServidor finalizado!")
