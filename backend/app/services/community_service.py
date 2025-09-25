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

    def get_user_playlists(self, token_info, limit=20, offset=0):
        """사용자의 플레이리스트 목록을 가져옵니다."""
        try:
            if self.sp_oauth.is_token_expired(token_info):
                token_info = self.sp_oauth.refresh_access_token(token_info['refresh_token'])
            
            sp = spotipy.Spotify(auth=token_info['access_token'])
            playlists = sp.current_user_playlists(limit=limit, offset=offset)
            
            return {
                'success': True,
                'playlists': playlists['items'],
                'total': playlists['total'],
                'updated_token': token_info
            }
        except Exception as e:
            print(f"플레이리스트 조회 중 오류: {e}")
            return {'success': False, 'error': str(e)}

    def search_tracks(self, token_info, query, limit=20, market='KR'):
        """트랙을 검색합니다."""
        try:
            if self.sp_oauth.is_token_expired(token_info):
                token_info = self.sp_oauth.refresh_access_token(token_info['refresh_token'])
            
            sp = spotipy.Spotify(auth=token_info['access_token'])
            results = sp.search(q=query, type='track', limit=limit, market=market)
            
            return {
                'success': True,
                'tracks': results['tracks']['items'],
                'updated_token': token_info
            }
        except Exception as e:
            print(f"트랙 검색 중 오류: {e}")
            return {'success': False, 'error': str(e)}

    def create_playlist(self, token_info, user_id, name, description="", public=True):
        """새 플레이리스트를 생성합니다."""
        try:
            if self.sp_oauth.is_token_expired(token_info):
                token_info = self.sp_oauth.refresh_access_token(token_info['refresh_token'])
            
            sp = spotipy.Spotify(auth=token_info['access_token'])
            playlist = sp.user_playlist_create(
                user=user_id,
                name=name,
                public=public,
                description=description
            )
            
            return {
                'success': True,
                'playlist': playlist,
                'updated_token': token_info
            }
        except Exception as e:
            print(f"플레이리스트 생성 중 오류: {e}")
            return {'success': False, 'error': str(e)}

    def add_tracks_to_playlist(self, token_info, playlist_id, track_uris):
        """플레이리스트에 트랙을 추가합니다."""
        try:
            if self.sp_oauth.is_token_expired(token_info):
                token_info = self.sp_oauth.refresh_access_token(token_info['refresh_token'])
            
            sp = spotipy.Spotify(auth=token_info['access_token'])
            
            # Spotify API는 한 번에 최대 100개 트랙만 추가 가능
            batch_size = 100
            for i in range(0, len(track_uris), batch_size):
                batch = track_uris[i:i + batch_size]
                sp.playlist_add_items(playlist_id, batch)
            
            return {
                'success': True,
                'updated_token': token_info
            }
        except Exception as e:
            print(f"트랙 추가 중 오류: {e}")
            return {'success': False, 'error': str(e)}

    def generate_kpop_playlist(self, token_info, theme, artists, track_count=20):
        """K-pop 테마별 플레이리스트를 생성합니다."""
        try:
            if self.sp_oauth.is_token_expired(token_info):
                token_info = self.sp_oauth.refresh_access_token(token_info['refresh_token'])
            
            sp = spotipy.Spotify(auth=token_info['access_token'])
            
            # 테마별 검색 쿼리 생성
            search_queries = []
            
            # 아티스트별 검색
            for artist in artists:
                search_queries.append(f"artist:{artist}")
            
            # 테마별 키워드 추가
            theme_keywords = {
                "도시 야경": ["night", "city", "urban"],
                "해변 휴양": ["summer", "beach", "vacation"],
                "축제 파티": ["party", "festival", "celebration"],
                "자연 힐링": ["healing", "nature", "calm"],
                "운동 피트니스": ["workout", "fitness", "energy"],
                "카페 브런치": ["cafe", "brunch", "cozy"]
            }
            
            if theme in theme_keywords:
                for keyword in theme_keywords[theme]:
                    search_queries.append(f"year:2020-2024 {keyword}")
            
            # K-pop 장르 추가
            search_queries.append("genre:k-pop year:2020-2024")
            
            all_tracks = []
            tracks_per_query = max(5, track_count // len(search_queries))
            
            for query in search_queries:
                try:
                    results = sp.search(q=query, type='track', limit=tracks_per_query, market='KR')
                    all_tracks.extend(results['tracks']['items'])
                except Exception as e:
                    print(f"검색 쿼리 '{query}' 실행 중 오류: {e}")
                    continue
            
            # 중복 제거 및 인기도 순 정렬
            seen_tracks = set()
            unique_tracks = []
            for track in all_tracks:
                track_id = track['id']
                if track_id not in seen_tracks:
                    seen_tracks.add(track_id)
                    unique_tracks.append(track)
            
            # 인기도 순으로 정렬하고 요청된 개수만큼 선택
            unique_tracks.sort(key=lambda x: x['popularity'], reverse=True)
            selected_tracks = unique_tracks[:track_count]
            
            return {
                'success': True,
                'tracks': selected_tracks,
                'updated_token': token_info
            }
        except Exception as e:
            print(f"K-pop 플레이리스트 생성 중 오류: {e}")
            return {'success': False, 'error': str(e)}