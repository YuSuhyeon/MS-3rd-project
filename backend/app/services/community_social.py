# -*- coding: utf-8 -*-
import mysql.connector
from mysql.connector import Error, errorcode
import os
import json
from datetime import datetime

from .storage_service import generate_sas_url

class BoardService:
    def __init__(self):
        self.connection_config = {
            'host': os.getenv('DB_HOST', '7aiteam03-db.mysql.database.azure.com'),
            'user': os.getenv('DB_USER', 'team03'),
            'password': os.getenv('DB_PASSWORD', 'msai07@2025'),
            'database': os.getenv('DB_NAME', 'team03db'),
            'port': int(os.getenv('DB_PORT', '3306')),
            'charset': 'utf8mb4',
            'use_unicode': True,
            'ssl_ca': os.getenv('SSL_CA_PATH'),  # Azure MySQL 연결 시 SSL 인증서 경로 (선택 사항)
            'autocommit': True
        }
        self.ensure_user_content_tables()
    
    def get_connection(self):
        try:
            config = self.connection_config.copy()
            if not config.get('ssl_ca'):
                # ssl_disabled는 더 이상 사용되지 않음. 대신 ssl_verify_cert=False 등을 사용.
                # Azure 기본 연결은 SSL을 사용하므로, 별도 설정이 없다면 ssl_ca를 제거.
                config.pop('ssl_ca', None)
            
            connection = mysql.connector.connect(**config)
            return connection
        except Error as e:
            print(f"데이터베이스 연결 오류: {e}")
            return None
        
    def ensure_user_content_tables(self):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                print("DB 연결 실패로 테이블 초기화를 건너뜁니다.")
                return

            cursor = connection.cursor(buffered=True)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_persona_profiles (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    answers LONGTEXT NULL,
                    analysis_result LONGTEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY uniq_user_persona_profiles_user (user_id),
                    CONSTRAINT fk_user_persona_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_itineraries (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    itinerary_id VARCHAR(128) NOT NULL,
                    itinerary_name VARCHAR(255),
                    destination VARCHAR(255),
                    total_days INT,
                    itinerary_json LONGTEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY uniq_user_itineraries (user_id, itinerary_id),
                    INDEX idx_user_itineraries_user (user_id),
                    CONSTRAINT fk_user_itineraries_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """)
        except Error as e:
            print(f"사용자 컨텐츠 테이블 초기화 실패: {e}")
        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()

    #===============================================================================
    # 게시글 생성
    def create_post(self, user_id, title, content, images=None):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return {'success': False, 'error': '데이터베이스 연결 실패'}
            
            connection.start_transaction()
            cursor = connection.cursor()
            
            # 게시글 생성
            post_query = "INSERT INTO boards (user_id, title, content) VALUES (%s, %s, %s)"
            cursor.execute(post_query, (user_id, title, content))
            board_id = cursor.lastrowid
            
            # 이미지가 있다면 추가
            if images:
                image_query = "INSERT INTO pictures (board_id, image_url, sort_order) VALUES (%s, %s, %s)"
                image_data = [(board_id, url, i) for i, url in enumerate(images)]
                cursor.executemany(image_query, image_data)
            
            connection.commit()
            
            return {
                'success': True,
                'board_id': board_id,
                'message': '게시글이 성공적으로 생성되었습니다.'
            }
            
        except Error as e:
            if connection:
                connection.rollback()
            print(f"게시글 생성 중 오류: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()
                
    # 게시글 수정
    def update_post(self, board_id, user_id, title, content):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return {'success': False, 'error': '데이터베이스 연결 실패'}
            
            cursor = connection.cursor(dictionary=True)
            
            # 게시글 작성자 확인
            check_query = "SELECT user_id FROM boards WHERE id = %s AND deleted_at IS NULL"
            cursor.execute(check_query, (board_id,))
            result = cursor.fetchone()
            
            if not result:
                return {'success': False, 'error': '게시글을 찾을 수 없습니다.'}
            
            if result['user_id'] != user_id:
                return {'success': False, 'error': '게시글을 수정할 권한이 없습니다.'}
            
            # 게시글 수정
            update_query = "UPDATE boards SET title = %s, content = %s, updated_at = NOW() WHERE id = %s"
            cursor.execute(update_query, (title, content, board_id))
            connection.commit()
            
            return {
                'success': True,
                'message': '게시글이 수정되었습니다.'
            }
            
        except Error as e:
            print(f"게시글 수정 중 오류: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()
                
    # 게시글 삭제 (소프트 삭제)
    def delete_post(self, board_id, user_id):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return {'success': False, 'error': '데이터베이스 연결 실패'}
            
            cursor = connection.cursor(dictionary=True)
            
            # 게시글 작성자 확인
            check_query = "SELECT user_id FROM boards WHERE id = %s"
            cursor.execute(check_query, (board_id,))
            result = cursor.fetchone()
            
            if not result:
                return {'success': False, 'error': '게시글을 찾을 수 없습니다.'}
            
            if result['user_id'] != user_id:
                return {'success': False, 'error': '게시글을 삭제할 권한이 없습니다.'}
            
            # 소프트 삭제
            delete_query = "UPDATE boards SET deleted_at = NOW() WHERE id = %s"
            cursor.execute(delete_query, (board_id,))
            connection.commit()
            
            return {
                'success': True,
                'message': '게시글이 삭제되었습니다.'
            }
            
        except Error as e:
            print(f"게시글 삭제 중 오류: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()

    # =================================================================
    # 소셜 정보로 사용자 조회 
    def get_user_by_social(self, provider, social_id):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return {'success': False, 'error': '데이터베이스 연결 실패'}
            
            cursor = connection.cursor(dictionary=True)
            
            query = "SELECT id, social_id, provider, name, email, profile_image, created_at FROM users WHERE provider = %s AND social_id = %s"
            print(f"DB 사용자 검색 시도: provider='{provider}', social_id='{social_id}'")
            
            cursor.execute(query, (provider, social_id))
            user = cursor.fetchone()
            print(f"DB 검색 결과: {user}")
            if user:
                return {'success': True, 'user': user}
            else:
                return {'success': False, 'error': '사용자를 찾을 수 없습니다.'}
            
        except Error as e:
            print(f"사용자 조회 중 오류: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()
                
    # 신규 사용자 생성 또는 기존 사용자 정보 업데이트
    def create_or_update_user(self, provider, social_id, email, name, profile_image=None):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return {'success': False, 'error': '데이터베이스 연결 실패'}
            
            cursor = connection.cursor(dictionary=True)

            # 1. provider + social_id로 기존 사용자 확인
            existing_user = self.get_user_by_social(provider, social_id)
            
            if existing_user['success']:
                # 기존 사용자 정보 업데이트
                user_id = existing_user['user']['id']
                update_query = "UPDATE users SET name = %s, email = %s, profile_image = %s WHERE id = %s"
                cursor.execute(update_query, (name, email, profile_image, user_id))
                connection.commit()
                return {'success': True, 'user_id': user_id, 'message': '사용자 정보가 업데이트되었습니다.'}
            
            # 2. 이메일로 기존 사용자 확인 (중복 방지)
            email_check_query = "SELECT id, provider FROM users WHERE email = %s"
            cursor.execute(email_check_query, (email,))
            existing_email_user = cursor.fetchone()
            
            if existing_email_user:
                print(f"⚠️ 이메일 중복 발견: {email}, 기존 provider: {existing_email_user['provider']}, 새 provider: {provider}")
                return {'success': False, 'error': f'이 이메일({email})은 이미 {existing_email_user["provider"]} 계정으로 등록되어 있습니다. 해당 방법으로 로그인해주세요.'}
                
            # 3. 신규 사용자 생성
            insert_query = "INSERT INTO users (name, email, profile_image, provider, social_id, created_at) VALUES (%s, %s, %s, %s, %s, NOW())"
            print(f"새로운 사용자 생성 시도: provider={provider}, social_id={social_id}, email={email}")
            
            cursor.execute(insert_query, (name, email, profile_image, provider, social_id))
            user_id = cursor.lastrowid
            connection.commit()
            print(f"신규 사용자 생성 완료: user_id={user_id}")
            return {'success': True, 'user_id': user_id, 'message': '새로운 사용자가 생성되었습니다.'}
        
        except mysql.connector.IntegrityError as ie:
            print(f"DB 제약 조건 위반: {ie}")
            if 'Duplicate entry' in str(ie):
                if 'email' in str(ie):
                    return {'success': False, 'error': '이미 등록된 이메일입니다. 다른 로그인 방법을 시도해주세요.'}
                elif 'uk_user' in str(ie): # UNIQUE KEY 이름에 따라 변경
                    return {'success': False, 'error': '이미 등록된 소셜 계정입니다.'}
            return {'success': False, 'error': f'사용자 등록 중 제약 조건 오류: {str(ie)}'}
        except mysql.connector.Error as e:
            print(f"MySQL 오류: {e}")
            return {'success': False, 'error': f'데이터베이스 오류: {str(e)}'}
        except Exception as e:
            print(f"일반 오류: {e}")
            import traceback
            traceback.print_exc()
            return {'success': False, 'error': f'사용자 생성 중 오류: {str(e)}'}
        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()

    # 로그인한 사용자 정보 조회
    def get_user_by_id(self, user_id):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return {'success': False, 'error': '데이터베이스 연결 실패'}
            
            cursor = connection.cursor(dictionary=True)
            
            query = "SELECT id, social_id, provider, name, email, profile_image, created_at FROM users WHERE id = %s"
            cursor.execute(query, (user_id,))
            user = cursor.fetchone()
            
            if user:
                return {'success': True, 'user': user}
            else:
                return {'success': False, 'error': '사용자를 찾을 수 없습니다.'}
            
        except Error as e:
            print(f"get_user_by_id 오류: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()

    # 특정 사용자의 게시글 목록
    def _hydrate_post_media(self, cursor, post_id):
        picture_query = "SELECT image_url FROM pictures WHERE board_id = %s ORDER BY sort_order"
        cursor.execute(picture_query, (post_id,))
        pictures = cursor.fetchall()
        image_urls = [generate_sas_url(pic['image_url']) for pic in pictures]

        tag_query = (
            "SELECT t.name FROM tags t "
            "JOIN board_tags bt ON t.id = bt.tag_id "
            "WHERE bt.board_id = %s"
        )
        cursor.execute(tag_query, (post_id,))
        tags = cursor.fetchall()
        tag_names = [tag['name'] for tag in tags]

        return image_urls, tag_names

    def get_user_posts(self, user_id, page=1, limit=10):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return {'success': False, 'error': '데이터베이스 연결 실패'}
            
            cursor = connection.cursor(dictionary=True)
            offset = (page - 1) * limit
            
            query = """
                SELECT 
                    b.id AS id, b.title, b.content, b.likes_count, 
                    b.comments_count, b.created_at, b.updated_at,
                    u.name AS user_name, u.profile_image AS user_profile_image
                FROM boards b
                JOIN users u ON b.user_id = u.id
                WHERE b.user_id = %s AND b.deleted_at IS NULL
                ORDER BY b.created_at DESC
                LIMIT %s OFFSET %s
            """
            cursor.execute(query, (user_id, limit, offset))
            posts = cursor.fetchall()
            
            # 각 게시글의 이미지와 태그를 별도로 조회
            for post in posts:
                pictures, tags = self._hydrate_post_media(cursor, post['id'])
                post['pictures'] = pictures
                post['tags'] = tags
            
            return {
                'success': True,
                'posts': posts,
                'pagination': {'page': page, 'limit': limit, 'has_more': len(posts) == limit}
            }
            
        except Error as e:
            print(f"사용자 게시글 조회 중 오류: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()

    def get_user_liked_posts(self, user_id, page=1, limit=10):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return {'success': False, 'error': '데이터베이스 연결 실패'}

            cursor = connection.cursor(dictionary=True)
            offset = (page - 1) * limit

            query = """
                SELECT
                    b.id AS id,
                    b.title,
                    b.content,
                    b.likes_count,
                    b.comments_count,
                    b.created_at,
                    b.updated_at,
                    u.id AS author_id,
                    u.name AS user_name,
                    u.profile_image AS user_profile_image,
                    l.created_at AS liked_at
                FROM likes l
                JOIN boards b ON l.board_id = b.id
                JOIN users u ON b.user_id = u.id
                WHERE l.user_id = %s AND b.deleted_at IS NULL
                ORDER BY l.created_at DESC
                LIMIT %s OFFSET %s
            """
            cursor.execute(query, (user_id, limit, offset))
            posts = cursor.fetchall()

            for post in posts:
                pictures, tags = self._hydrate_post_media(cursor, post['id'])
                post['pictures'] = pictures
                post['tags'] = tags
                post['is_liked_by_current_user'] = True

            return {
                'success': True,
                'posts': posts,
                'pagination': {'page': page, 'limit': limit, 'has_more': len(posts) == limit}
            }

        except Error as e:
            print(f"사용자 좋아요 게시글 조회 중 오류: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()
                
    #==============================================================                
    # 게시글 목록 조회 (태그 포함)
    def get_posts(self, page=1, limit=10, user_id=None):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return {'success': False, 'error': '데이터베이스 연결 실패'}
            
            cursor = connection.cursor(dictionary=True)
            offset = (page - 1) * limit
            
            posts_query = """
                SELECT b.id as board_id, b.title, b.content, b.created_at, b.updated_at,
                    u.id as user_id, u.name as user_name, u.profile_image as user_profile_image,
                    b.likes_count, b.comments_count
            """
            
            # 로그인한 사용자인 경우 좋아요 상태 확인
            if user_id:
                posts_query += ", (SELECT COUNT(*) FROM likes WHERE board_id = b.id AND user_id = %s) > 0 as is_liked_by_current_user"
            else:
                posts_query += ", FALSE as is_liked_by_current_user"
                
            posts_query += """
                FROM boards b
                JOIN users u ON b.user_id = u.id
                WHERE b.deleted_at IS NULL
                ORDER BY b.created_at DESC
                LIMIT %s OFFSET %s
            """
            
            # 파라미터 바인딩 설정
            params = (user_id, limit, offset) if user_id else (limit, offset)
            cursor.execute(posts_query, params)
            posts = cursor.fetchall()            

            # 각 게시글의 태그와 이미지 조회
            for post in posts:
                # 이미지 조회
                picture_query = "SELECT image_url FROM pictures WHERE board_id = %s ORDER BY sort_order"
                cursor.execute(picture_query, (post['board_id'],))
                pictures = cursor.fetchall()
                post['pictures'] = [generate_sas_url(pic['image_url']) for pic in pictures]
                
                # 태그 조회
                tag_query = "SELECT t.name FROM tags t JOIN board_tags bt ON t.id = bt.tag_id WHERE bt.board_id = %s"
                cursor.execute(tag_query, (post['board_id'],))
                tags = cursor.fetchall()
                post['tags'] = [tag['name'] for tag in tags]
                
                # 날짜 포맷팅
                if post['created_at']:
                    post['created_at'] = post['created_at'].strftime('%Y-%m-%d %H:%M:%S')
                if post['updated_at']:
                    post['updated_at'] = post['updated_at'].strftime('%Y-%m-%d %H:%M:%S')
            
            # 전체 개수 조회
            count_query = "SELECT COUNT(*) as total FROM boards WHERE deleted_at IS NULL"
            cursor.execute(count_query)
            total_count = cursor.fetchone()['total']
            
            # 페이지네이션 정보
            total_pages = (total_count + limit - 1) // limit
            pagination = {
                'current_page': page, 'total_pages': total_pages, 'total_count': total_count,
                'limit': limit, 'has_next': page < total_pages, 'has_prev': page > 1
            }
            
            return {'success': True, 'posts': posts, 'pagination': pagination}
            
        except mysql.connector.Error as e:
            print(f"게시글 목록 조회 오류: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()

    # 인기 태그
    def get_trending_tags(self, limit=5):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return {'success': False, 'error': 'DB 연결 실패'}
            
            cursor = connection.cursor(dictionary=True)
        
            # v_trending_tags 뷰가 있다면 사용, 없다면 직접 쿼리
            try:
                query = "SELECT tag, count FROM v_trending_tags LIMIT %s"
                cursor.execute(query, (limit,))
            except mysql.connector.Error:
                query = """
                    SELECT t.name as tag, COUNT(bt.board_id) as count
                    FROM tags t
                    JOIN board_tags bt ON t.id = bt.tag_id
                    JOIN boards b ON bt.board_id = b.id
                    WHERE b.deleted_at IS NULL
                    GROUP BY t.id, t.name
                    ORDER BY count DESC
                    LIMIT %s
                """
                cursor.execute(query, (limit,))
            
            tags = cursor.fetchall()
            return {'success': True, 'tags': tags}
            
        except mysql.connector.Error as e:
            print(f"인기 태그 조회 오류: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()

    # 인기 게시글 조회
    def get_trending_posts(self, limit=5):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return {'success': False, 'error': 'DB 연결 실패'}
            
            cursor = connection.cursor(dictionary=True)
            
            query = """
                SELECT 
                    b.id as board_id, b.title, b.likes_count, b.comments_count, b.created_at,
                    u.name as user_name, u.profile_image as user_profile_image
                FROM boards b
                JOIN users u ON b.user_id = u.id
                WHERE b.deleted_at IS NULL
                ORDER BY b.likes_count DESC, b.comments_count DESC, b.created_at DESC
                LIMIT %s
            """
            cursor.execute(query, (limit,))
            posts = cursor.fetchall()
            
            # 날짜 포맷 변환
            for post in posts:
                if post['created_at']:
                    post['created_at'] = post['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            
            return {'success': True, 'posts': posts}
            
        except mysql.connector.Error as e:
            print(f"인기 게시글 조회 오류: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()

    #===============================================================================
    # 특정 태그의 게시글 조회 
    def get_posts_by_tag(self, tag_name, page=1, limit=10):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return {'success': False, 'error': 'DB 연결 실패'}
            
            cursor = connection.cursor(dictionary=True)
            offset = (page - 1) * limit
            
            query = """
                SELECT b.id as board_id, b.title, b.content, b.likes_count, 
                    b.comments_count, b.created_at, b.updated_at,
                    u.id as user_id, u.name as user_name, u.profile_image as user_profile_image
                FROM boards b
                JOIN users u ON b.user_id = u.id
                JOIN board_tags bt ON b.id = bt.board_id
                JOIN tags t ON bt.tag_id = t.id
                WHERE t.name = %s AND b.deleted_at IS NULL
                ORDER BY b.created_at DESC
                LIMIT %s OFFSET %s
            """
            cursor.execute(query, (tag_name, limit, offset))
            posts = cursor.fetchall()
            
            return {'success': True, 'posts': posts}
            
        except mysql.connector.Error as e:
            print(f"태그별 게시글 조회 오류: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()
                          
    # 게시글 상세 정보 조회
    def get_post_detail(self, board_id, current_user_id=None):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return {'success': False, 'error': '데이터베이스 연결 실패'}
            
            cursor = connection.cursor(dictionary=True)
            
            # 게시글 상세 정보 조회
            post_query = """
                SELECT 
                    b.id as board_id, b.user_id as author_id, b.title, b.content, b.likes_count,
                    b.comments_count, b.created_at, b.updated_at,
                    u.id as user_id, u.name as user_name, u.profile_image as user_profile_image
                FROM boards b
                JOIN users u ON b.user_id = u.id
                WHERE b.id = %s AND b.deleted_at IS NULL
            """
            cursor.execute(post_query, (board_id,))
            post = cursor.fetchone()
            
            if not post:
                return {'success': False, 'error': '게시글을 찾을 수 없습니다.'}
            
            # 현재 사용자가 이 게시글을 좋아하는지 확인
            is_liked = False
            if current_user_id:
                like_query = "SELECT 1 FROM likes WHERE user_id = %s AND board_id = %s"
                cursor.execute(like_query, (current_user_id, board_id))
                is_liked = cursor.fetchone() is not None
            post['is_liked_by_current_user'] = is_liked
            
            # 이미지 조회
            picture_query = "SELECT image_url FROM pictures WHERE board_id = %s ORDER BY sort_order"
            cursor.execute(picture_query, (board_id,))
            pictures = cursor.fetchall()
            post['pictures'] = [generate_sas_url(pic['image_url']) for pic in pictures]
            
            # 태그 조회
            tag_query = "SELECT t.name FROM tags t JOIN board_tags bt ON t.id = bt.tag_id WHERE bt.board_id = %s"
            cursor.execute(tag_query, (board_id,))
            tags = cursor.fetchall()
            post['tags'] = [tag['name'] for tag in tags]
            
            # 댓글 조회 (현재 사용자 권한 정보 포함)
            comment_query = """
                SELECT c.id as comment_id, c.user_id as comment_author_id, c.content, c.created_at,
                    u.name as user_name, u.profile_image as user_profile_image
                FROM comments c
                JOIN users u ON c.user_id = u.id
                WHERE c.board_id = %s AND c.deleted_at IS NULL
                ORDER BY c.created_at ASC
            """
            cursor.execute(comment_query, (board_id,))
            comments = cursor.fetchall()
            
            for comment in comments:
                comment['can_edit'] = current_user_id == comment['comment_author_id']
                comment['can_delete'] = current_user_id == comment['comment_author_id']
                if comment['created_at']:
                    comment['created_at'] = comment['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            
            # 게시글에 대한 사용자 권한 정보
            user_permissions = {
                'can_edit_post': current_user_id == post['author_id'],
                'can_delete_post': current_user_id == post['author_id']
            }
            
            # 날짜 포맷팅
            if post['created_at']:
                post['created_at'] = post['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            if post['updated_at']:
                post['updated_at'] = post['updated_at'].strftime('%Y-%m-%d %H:%M:%S')
            
            return {
                'success': True, 'post': post, 'comments': comments, 'user_permissions': user_permissions
            }
            
        except mysql.connector.Error as e:
            print(f"게시글 상세 조회 오류: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()
   
    # 게시글 검색
    def search_posts(self, query, page=1, limit=10, user_id=None):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return {'success': False, 'error': '데이터베이스 연결 실패'}
            
            cursor = connection.cursor(dictionary=True)
            offset = (page - 1) * limit
            
            # 검색 쿼리 (제목, 내용, 태그에서 검색)
            search_query = """
                SELECT DISTINCT b.id as board_id, b.title, b.content, b.likes_count,
                    b.comments_count, b.created_at, b.updated_at,
                    u.id as user_id, u.name as user_name, u.profile_image as user_profile_image
                FROM boards b
                JOIN users u ON b.user_id = u.id
                LEFT JOIN board_tags bt ON b.id = bt.board_id
                LEFT JOIN tags t ON bt.tag_id = t.id
                WHERE b.deleted_at IS NULL AND (b.title LIKE %s OR b.content LIKE %s OR t.name LIKE %s)
                ORDER BY b.created_at DESC
                LIMIT %s OFFSET %s
            """
            
            search_term = f"%{query}%"
            cursor.execute(search_query, (search_term, search_term, search_term, limit, offset))
            posts = cursor.fetchall()
            
            for post in posts:
                tag_query = "SELECT t.name FROM tags t JOIN board_tags bt ON t.id = bt.tag_id WHERE bt.board_id = %s"
                cursor.execute(tag_query, (post['board_id'],))
                tags = cursor.fetchall()
                post['tags'] = [tag['name'] for tag in tags]
                
                picture_query = "SELECT image_url FROM pictures WHERE board_id = %s ORDER BY sort_order"
                cursor.execute(picture_query, (post['board_id'],))
                pictures = cursor.fetchall()
                post['pictures'] = [generate_sas_url(pic['image_url']) for pic in pictures]
                
                if post['created_at']:
                    post['created_at'] = post['created_at'].strftime('%Y-%m-%d %H:%M:%S')
                if post['updated_at']:
                    post['updated_at'] = post['updated_at'].strftime('%Y-%m-%d %H:%M:%S')
            
            return {
                'success': True, 'posts': posts,
                'pagination': {'page': page, 'limit': limit, 'has_more': len(posts) == limit}
            }
            
        except mysql.connector.Error as e:
            print(f"게시글 검색 오류: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()
   
    #===========================================================================================                
    # 선택된 게시글의 댓글 확인
    def get_comments(self, board_id):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return {'success': False, 'error': '데이터베이스 연결 실패'}
            
            cursor = connection.cursor(dictionary=True)
            
            query = """
                SELECT c.id AS comment_id, c.content, c.created_at,
                    u.name AS user_name, u.profile_image AS user_profile_image
                FROM comments c
                JOIN users u ON c.user_id = u.id
                WHERE c.board_id = %s AND c.deleted_at IS NULL
                ORDER BY c.created_at ASC
            """
            
            cursor.execute(query, (board_id,))
            comments = cursor.fetchall()
            
            return {'success': True, 'comments': comments}
            
        except Error as e:
            print(f"댓글 조회 중 오류: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()
                
    # 댓글 생성
    def create_comment(self, board_id, user_id, content):            
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return {'success': False, 'error': '데이터베이스 연결 실패'}
            
            connection.start_transaction()
            cursor = connection.cursor(dictionary=True)
            
            # 댓글 생성
            insert_query = "INSERT INTO comments (board_id, user_id, content) VALUES (%s, %s, %s)"
            cursor.execute(insert_query, (board_id, user_id, content))
            comment_id = cursor.lastrowid
            
            # 게시글의 댓글 수 업데이트
            update_query = "UPDATE boards SET comments_count = (SELECT COUNT(*) FROM comments WHERE board_id = %s AND deleted_at IS NULL) WHERE id = %s"
            cursor.execute(update_query, (board_id, board_id))
            
            # 생성된 댓글 정보 조회
            select_query = """
                SELECT c.id as comment_id, c.user_id as comment_author_id, c.content, c.created_at,
                    u.name as user_name, u.profile_image as user_profile_image
                FROM comments c
                JOIN users u ON c.user_id = u.id
                WHERE c.id = %s
            """
            cursor.execute(select_query, (comment_id,))
            comment = cursor.fetchone()
            
            if comment:
                comment['can_edit'] = True
                comment['can_delete'] = True
                if comment['created_at']:
                    comment['created_at'] = comment['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            
            connection.commit()
            
            return {'success': True, 'comment_id': comment_id, 'comment': comment, 'message': '댓글이 성공적으로 생성되었습니다.'}
            
        except Error as e:
            if connection:
                connection.rollback()
            print(f"댓글 생성 중 오류: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()

    # 댓글 수정
    def update_comment(self, comment_id, user_id, content):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return {'success': False, 'error': '데이터베이스 연결 실패'}
            
            cursor = connection.cursor(dictionary=True)
            
            # 댓글 작성자 확인
            check_query = "SELECT user_id FROM comments WHERE id = %s AND deleted_at IS NULL"
            cursor.execute(check_query, (comment_id,))
            comment_info = cursor.fetchone()
            
            if not comment_info:
                return {'success': False, 'error': '댓글을 찾을 수 없습니다.'}
            
            if comment_info['user_id'] != user_id:
                return {'success': False, 'error': '댓글을 수정할 권한이 없습니다.'}
            
            # 댓글 수정
            update_query = "UPDATE comments SET content = %s, updated_at = NOW() WHERE id = %s"
            cursor.execute(update_query, (content, comment_id))
            
            # 수정된 댓글 정보 조회
            select_query = """
                SELECT c.id as comment_id, c.user_id as comment_author_id, c.content, c.created_at, c.updated_at,
                    u.name as user_name, u.profile_image as user_profile_image
                FROM comments c JOIN users u ON c.user_id = u.id
                WHERE c.id = %s
            """
            cursor.execute(select_query, (comment_id,))
            comment = cursor.fetchone()
            
            if comment:
                comment['can_edit'] = True
                comment['can_delete'] = True
                if comment['created_at']:
                    comment['created_at'] = comment['created_at'].strftime('%Y-%m-%d %H:%M:%S')
                if comment['updated_at']:
                    comment['updated_at'] = comment['updated_at'].strftime('%Y-%m-%d %H:%M:%S')

            connection.commit()
            
            return {'success': True, 'comment': comment, 'message': '댓글이 수정되었습니다.'}
            
        except Error as e:
            print(f"댓글 수정 중 오류: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()

    # 댓글 삭제
    def delete_comment(self, comment_id, user_id):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return {'success': False, 'error': '데이터베이스 연결 실패'}
            
            connection.start_transaction()
            cursor = connection.cursor(dictionary=True)
            
            # 댓글 작성자 확인
            check_query = "SELECT user_id, board_id FROM comments WHERE id = %s AND deleted_at IS NULL"
            cursor.execute(check_query, (comment_id,))
            comment_info = cursor.fetchone()
            
            if not comment_info:
                return {'success': False, 'error': '댓글을 찾을 수 없습니다.'}
            
            if comment_info['user_id'] != user_id:
                return {'success': False, 'error': '댓글을 삭제할 권한이 없습니다.'}
            
            # 소프트 삭제
            delete_query = "UPDATE comments SET deleted_at = NOW() WHERE id = %s"
            cursor.execute(delete_query, (comment_id,))
            
            # 게시글의 댓글 수 업데이트
            board_id = comment_info['board_id']
            update_query = "UPDATE boards SET comments_count = (SELECT COUNT(*) FROM comments WHERE board_id = %s AND deleted_at IS NULL) WHERE id = %s"
            cursor.execute(update_query, (board_id, board_id))
            
            connection.commit()
            
            return {'success': True, 'message': '댓글이 삭제되었습니다.'}
            
        except Error as e:
            if connection:
                connection.rollback()
            print(f"댓글 삭제 중 오류: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()             
                    
    #========================================
    # Likes 기능
    # 좋아요 상태 조회
    def get_like_status(self, board_id, user_id):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return {'success': False, 'error': '데이터베이스 연결 실패'}
            
            cursor = connection.cursor(dictionary=True)
            
            board_query = "SELECT likes_count FROM boards WHERE id = %s AND deleted_at IS NULL"
            cursor.execute(board_query, (board_id,))
            board = cursor.fetchone()
            
            if not board:
                return {'success': False, 'error': '존재하지 않는 게시글입니다.'}
            
            like_query = "SELECT 1 FROM likes WHERE board_id = %s AND user_id = %s"
            cursor.execute(like_query, (board_id, user_id))
            is_liked = cursor.fetchone() is not None
            
            return {'success': True, 'is_liked': is_liked, 'likes_count': board['likes_count']}
            
        except Error as e:
            print(f"좋아요 상태 조회 중 오류: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()

    # 좋아요 생성
    def add_like(self, board_id, user_id):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return {'success': False, 'error': '데이터베이스 연결 실패'}
            
            connection.start_transaction()
            cursor = connection.cursor(dictionary=True)
            
            # 게시글 존재 여부 확인
            check_board_query = "SELECT id FROM boards WHERE id = %s AND deleted_at IS NULL"
            cursor.execute(check_board_query, (board_id,))
            if not cursor.fetchone():
                return {'success': False, 'error': '존재하지 않는 게시글입니다.'}
            
            # 이미 좋아요 했는지 확인
            check_like_query = "SELECT 1 FROM likes WHERE board_id = %s AND user_id = %s"
            cursor.execute(check_like_query, (board_id, user_id))
            if cursor.fetchone():
                return {'success': False, 'error': '이미 좋아요를 눌렀습니다.'}
            
            # 좋아요 추가
            insert_query = "INSERT INTO likes (board_id, user_id) VALUES (%s, %s)"
            cursor.execute(insert_query, (board_id, user_id))
            
            # 게시글의 좋아요 수 업데이트
            update_query = "UPDATE boards SET likes_count = (SELECT COUNT(*) FROM likes WHERE board_id = %s) WHERE id = %s"
            cursor.execute(update_query, (board_id, board_id))
            
            # 현재 좋아요 수 조회
            cursor.execute("SELECT likes_count FROM boards WHERE id = %s", (board_id,))
            likes_count = cursor.fetchone()['likes_count']
            
            connection.commit()
            
            return {'success': True, 'likes_count': likes_count, 'message': '좋아요를 추가했습니다.'}
            
        except Error as e:
            if connection:
                connection.rollback()
            print(f"좋아요 추가 중 오류: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()

    # 좋아요 삭제
    def remove_like(self, board_id, user_id):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return {'success': False, 'error': '데이터베이스 연결 실패'}
            
            connection.start_transaction()
            cursor = connection.cursor(dictionary=True)
            
            # 좋아요 했는지 확인
            delete_query = "DELETE FROM likes WHERE board_id = %s AND user_id = %s"
            cursor.execute(delete_query, (board_id, user_id))

            if cursor.rowcount == 0:
                 return {'success': False, 'error': '좋아요를 누르지 않았습니다.'}
            
            # 게시글의 좋아요 수 업데이트
            update_query = "UPDATE boards SET likes_count = (SELECT COUNT(*) FROM likes WHERE board_id = %s) WHERE id = %s"
            cursor.execute(update_query, (board_id, board_id))
            
            # 현재 좋아요 수 조회
            cursor.execute("SELECT likes_count FROM boards WHERE id = %s", (board_id,))
            likes_count = cursor.fetchone()['likes_count']
            
            connection.commit()
            
            return {'success': True, 'likes_count': likes_count, 'message': '좋아요를 취소했습니다.'}
            
        except Error as e:  
            if connection:
                connection.rollback()
            print(f"좋아요 취소 중 오류: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()

    def _to_millis(self, value):
        if isinstance(value, datetime):
            return int(value.timestamp() * 1000)
        return None

    def _deserialize_persona_profile_row(self, row):
        if not row:
            return None
        
        def safe_json_loads(data, default_val):
            if not data: return default_val
            try:
                return json.loads(data)
            except (json.JSONDecodeError, TypeError):
                return default_val

        return {
            'id': row.get('id'),
            'user_id': row.get('user_id'),
            'answers': safe_json_loads(row.get('answers'), None),
            'analysis_result': safe_json_loads(row.get('analysis_result'), {}),
            'created_at': self._to_millis(row.get('created_at')),
            'updated_at': self._to_millis(row.get('updated_at')),
        }

    def create_persona_profile(self, user_id, answers, analysis_result):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return {'success': False, 'error': 'database_connection_failed'}
            
            serialized_answers = json.dumps(answers, ensure_ascii=False) if answers is not None else None
            serialized_result = json.dumps(analysis_result, ensure_ascii=False)

            cursor = connection.cursor()
            query = """
                INSERT INTO user_persona_profiles (user_id, answers, analysis_result)
                VALUES (%s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    answers = VALUES(answers),
                    analysis_result = VALUES(analysis_result),
                    updated_at = CURRENT_TIMESTAMP
            """
            cursor.execute(query, (user_id, serialized_answers, serialized_result))
            connection.commit()

            cursor.close()
            cursor = connection.cursor(dictionary=True, buffered=True)
            
            cursor.execute("SELECT * FROM user_persona_profiles WHERE user_id = %s", (user_id,))
            row = cursor.fetchone()
            profile = self._deserialize_persona_profile_row(row)

            return {'success': True, 'profile': profile}
        except Error as e:
            if connection:
                connection.rollback()
            print(f"페르소나 프로필 생성/수정 오류: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()

    def list_persona_profiles(self, user_id, limit=20):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return {'success': False, 'error': '데이터베이스 연결 실패'}
            cursor = connection.cursor(dictionary=True, buffered=True)
            cursor.execute(
                "SELECT * FROM user_persona_profiles WHERE user_id = %s ORDER BY updated_at DESC LIMIT %s",
                (user_id, int(limit)),
            )
            rows = cursor.fetchall()
            profiles = [self._deserialize_persona_profile_row(row) for row in rows]
            return {'success': True, 'profiles': profiles}
        except Error as e:
            print(f"페르소나 프로필 조회 오류: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()

    def _deserialize_itinerary_row(self, row):
        if not row:
            return None
        
        payload = {}
        if row.get('itinerary_json'):
            try:
                payload = json.loads(row['itinerary_json'])
            except json.JSONDecodeError:
                pass
        
        if not isinstance(payload, dict):
            payload = {'value': payload}

        # DB 데이터를 우선으로 사용
        payload['id'] = row.get('itinerary_id')
        payload['itinerary_name'] = row.get('itinerary_name')
        payload['destination'] = row.get('destination')
        payload['total_days'] = row.get('total_days')
        payload['created_at'] = self._to_millis(row.get('created_at'))
        payload['updated_at'] = self._to_millis(row.get('updated_at'))
        return payload

    def upsert_itinerary(self, user_id, itinerary):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return {'success': False, 'error': '데이터베이스 연결 실패'}
            
            itinerary_id = itinerary.get('id') or f"itinerary_{int(datetime.utcnow().timestamp() * 1000)}"
            itinerary['id'] = itinerary_id

            serialized_itinerary = json.dumps(itinerary, ensure_ascii=False)
            
            cursor = connection.cursor()
            query = """
                INSERT INTO user_itineraries (user_id, itinerary_id, itinerary_name, destination, total_days, itinerary_json)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    itinerary_name = VALUES(itinerary_name),
                    destination = VALUES(destination),
                    total_days = VALUES(total_days),
                    itinerary_json = VALUES(itinerary_json),
                    updated_at = CURRENT_TIMESTAMP
            """
            params = (
                user_id, itinerary_id, itinerary.get('itinerary_name'),
                itinerary.get('destination'), itinerary.get('total_days'), serialized_itinerary
            )
            cursor.execute(query, params)
            connection.commit()
            
            cursor.close()
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM user_itineraries WHERE user_id = %s AND itinerary_id = %s", (user_id, itinerary_id))
            row = cursor.fetchone()
            
            return {'success': True, 'itinerary': self._deserialize_itinerary_row(row)}
        except Error as e:
            if connection:
                connection.rollback()
            print(f"여행 일정 저장 오류: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()

    def list_itineraries(self, user_id, limit=20):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return {'success': False, 'error': '데이터베이스 연결 실패'}
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM user_itineraries WHERE user_id = %s ORDER BY updated_at DESC LIMIT %s", (user_id, int(limit)))
            rows = cursor.fetchall()
            items = [self._deserialize_itinerary_row(row) for row in rows]
            return {'success': True, 'itineraries': items}
        except Error as e:
            print(f"여행 일정 조회 오류: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()

    def delete_itinerary(self, user_id, itinerary_id):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return {'success': False, 'error': '데이터베이스 연결 실패'}
            cursor = connection.cursor()
            cursor.execute("DELETE FROM user_itineraries WHERE user_id = %s AND itinerary_id = %s", (user_id, itinerary_id))
            affected = cursor.rowcount
            connection.commit()
            return {'success': True, 'deleted': affected > 0}
        except Error as e:
            if connection:
                connection.rollback()
            print(f"여행 일정 삭제 오류: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()
