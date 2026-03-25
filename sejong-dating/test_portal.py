import requests
import ssl
import urllib3
from sejong_univ_auth import auth, PortalSSOToken
from urllib3.util import create_urllib3_context

# Custom adapter to allow legacy SSL/TLS versions
class LegacyHttpAdapter(requests.adapters.HTTPAdapter):
    def init_poolmanager(self, *args, **kwargs):
        # Allow TLSv1.2 which is often needed for older university systems
        context = create_urllib3_context(ssl_version=ssl.PROTOCOL_TLSv1_2)
        # Enable legacy server connection support (OP_LEGACY_SERVER_CONNECT)
        context.options |= 0x4  
        kwargs['ssl_context'] = context
        return super().init_poolmanager(*args, **kwargs)

# Monkey-patching requests to use the legacy adapter globally for the library's requests
session = requests.Session()
adapter = LegacyHttpAdapter()
session.mount('https://', adapter)

# The library uses requests.post, so we need to ensure it uses our session or is configured similarly.
# However, the library doesn't expose the session. Let's try to bypass the SSL check directly in the library's environment.
# Note: This is for testing the connection only.

def run_test():
    id = '23011679'
    pw = 'lkh068995!'
    try:
        # Some libraries might allow verify=False or we can try to disable warnings
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        
        # We try to use the library's auth function but the underlying requests call might fail
        # if it doesn't support the legacy server.
        result = auth(id=id, password=pw, methods=PortalSSOToken)
        print(f"Success: {result.is_auth}")
        print(f"Code: {result.code}")
        print(f"Body: {result.body}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    run_test()
