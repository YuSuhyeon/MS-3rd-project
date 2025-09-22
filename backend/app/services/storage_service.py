import os
import uuid
from urllib.parse import urlparse, urlunparse, parse_qs, urlencode
from azure.storage.blob import BlobServiceClient

# =====================================================================
# 1. 환경 변수 가져오기 및 BlobServiceClient 초기화
# Azure Blob Storage 환경 변수
CONTAINER_NAME = os.getenv("AZURE_STORAGE_CONTAINER_NAME")
SAS_TOKEN = os.getenv("AZURE_SAS_TOKEN")

# Blob Service Client 초기화
try:
    AZURE_STORAGE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
    if not AZURE_STORAGE_CONNECTION_STRING:
        print("경고: AZURE_STORAGE_CONNECTION_STRING 환경 변수가 설정되지 않았습니다.")
        blob_service_client = None
    else:
        blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)

except Exception as e:
    print(f" 오류 발생: {e}")
    blob_service_client = None

# =====================================================================
# 2. Blob Storage 관련 함수들


def generate_sas_url(blob_url: str) -> str:
    if not SAS_TOKEN:
        print("SAS 토큰 없음")
        return blob_url

    try:
        parsed_url = urlparse(blob_url)
        query_params = parse_qs(parsed_url.query)
        sas_params = parse_qs(SAS_TOKEN)
        query_params.update(sas_params)
        
        new_query = urlencode(query_params, doseq=True)

        new_url = urlunparse((
            parsed_url.scheme,
            parsed_url.netloc,
            parsed_url.path,
            parsed_url.params,
            new_query,
            parsed_url.fragment
        ))
        
        return new_url
    
    except Exception as e:
        print(f"SAS URL 생성 중 오류 발생: {e}")
        return blob_url



def upload_image(file_stream, container_name: str = CONTAINER_NAME) -> dict:
    if not blob_service_client:
        return {'success': False, 'error': 'Blob Storage 클라이언트 초기화 실패'}

    try:
        original_filename = file_stream.filename
        file_extension = os.path.splitext(original_filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        container_client = blob_service_client.get_container_client(container_name)
        
        # 컨테이너가 존재하지 않으면 생성
        try:
            container_client.create_container()
        except Exception:
            pass # 컨테이너가 이미 존재하면 무시

        blob_client = container_client.get_blob_client(unique_filename)
        
        # MIME 타입 설정 - ContentSettings 객체 사용
        from azure.storage.blob import ContentSettings
        
        content_type = 'image/jpeg'
        if file_extension.lower() in ['.png']:
            content_type = 'image/png'
        elif file_extension.lower() in ['.gif']:
            content_type = 'image/gif'
        elif file_extension.lower() in ['.webp']:
            content_type = 'image/webp'
        
        # 수정된 부분: ContentSettings 객체 생성
        content_settings = ContentSettings(content_type=content_type)
        
        # 파일 업로드
        blob_client.upload_blob(
            file_stream, 
            overwrite=True,
            content_settings=content_settings  # ContentSettings 객체 전달
        )
        
        blob_url = blob_client.url
        
        return {'success': True, 'url': blob_url}
    
    except Exception as e:
        print(f"이미지 업로드 중 오류 발생: {e}")
        return {'success': False, 'error': str(e)}