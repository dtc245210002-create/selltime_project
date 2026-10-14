import json, socket, ssl, struct

host = 'aws-0-ap-northeast-1.pooler.supabase.com'
ca = 'C:/Users/admin/Downloads/prod-ca-2021.crt'
try:
    addresses = sorted({x[4][0] for x in socket.getaddrinfo(host, 5432, socket.AF_INET, socket.SOCK_STREAM)})
    context = ssl.create_default_context(cafile=ca)
    context.check_hostname = True
    context.verify_mode = ssl.CERT_REQUIRED
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as connection:
        connection.settimeout(15)
        connection.connect((addresses[0], 5432))
        connection.sendall(struct.pack('!II', 8, 80877103))
        if connection.recv(1) != b'S':
            raise RuntimeError('PostgreSQL endpoint rejected TLS negotiation')
        with context.wrap_socket(connection, server_hostname=host) as secured:
            print(json.dumps({'host': host, 'port': 5432, 'ipv4': addresses,
                'tls_verified': True, 'hostname_verified': True,
                'tls_version': secured.version(), 'cipher': secured.cipher()[0],
                'authentication': 'NOT ATTEMPTED', 'queries': 'NONE'}))
except Exception as error:
    print(json.dumps({'tls_verified': False, 'error_type': type(error).__name__, 'error': str(error)}))
    raise SystemExit(1)
