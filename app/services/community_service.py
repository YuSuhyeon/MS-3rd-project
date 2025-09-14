import os
import spotipy
from spotipy.oauth2 import SpotifyOAuth

# 필요한 권한 범위를 정의합니다.
SCOPE = "playlist-modify-public playlist-modify-private user-read-private user-top-read"

class SpotifyService:
    def __init__(self):
        """
        SpotifyOAuth 객체를 초기화합니다. 이 객체는 인증 URL 생성,
        토큰 발급 및 갱신 등 인증의 모든 과정을 관리합니다.
        """
        self.sp_oauth = SpotifyOAuth(
            client_id=os.getenv("SPOTIFY_CLIENT_ID"),
            client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
            redirect_uri=os.getenv("SPOTIFY_REDIRECT_URI"),
            scope=SCOPE
        )

    def get_auth_url(self):
        """Spotify 인증 페이지로 이동할 URL을 생성합니다."""
        return self.sp_oauth.get_authorize_url()

    def get_token_info(self, auth_code):
        """인증 코드를 사용하여 액세스 토큰과 리프레시 토큰을 발급받습니다."""
        return self.sp_oauth.get_access_token(auth_code, as_dict=True)

    def get_current_user(self, token_info):
        """
        토큰 정보를 사용하여 현재 로그인된 사용자의 프로필을 가져옵니다.
        토큰이 만료되었으면 자동으로 갱신하고, 갱신된 토큰을 함께 반환합니다.
        """
        try:
            # 토큰이 유효한지 확인하고, 만료되었다면 갱신합니다.
            if self.sp_oauth.is_token_expired(token_info):
                token_info = self.sp_oauth.refresh_access_token(token_info['refresh_token'])
            
            # 유효한 토큰으로 spotipy 클라이언트 객체를 생성합니다.
            sp = spotipy.Spotify(auth=token_info['access_token'])
            user_profile = sp.current_user()
            
            return {
                'success': True,
                'user': user_profile,
                'updated_token': token_info  # 갱신되었을 수 있으므로 항상 반환
            }
        except Exception as e:
            print(f"Spotify 사용자 정보 조회 또는 토큰 갱신 중 오류: {e}")
            # SpotipyError의 경우 여기서 처리하여 에러 메시지를 더 명확하게 할 수 있습니다.
            return {'success': False, 'error': str(e)}
