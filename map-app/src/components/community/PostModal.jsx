import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Plus, Edit, Image as ImageIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const PostModal = ({ mode = "create", post = null, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
  });
  const [images, setImages] = useState([]); // ⭐ 추가: 선택된 이미지 파일 상태
  const [imagePreviews, setImagePreviews] = useState([]); // ⭐ 추가: 이미지 미리보기 URL 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { profile } = useAuth();

  // 수정 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (mode === "edit" && post) {
      setFormData({
        title: post.title || "",
        content: post.content || "",
        tags: Array.isArray(post.tags) ? post.tags.join(", ") : post.tags || "",
      });
      // 수정 모드에서는 기존 이미지 URL을 미리보기로 설정
      if (post.pictures) {
        setImagePreviews(post.pictures.map((p) => p.image_url));
      }
    }
  }, [mode, post]);

  // 이미지 선택 핸들러
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    // 파일 미리보기 URL 생성
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!e.target.checkValidity()) {
      setError("모든 필수 항목을 입력해주세요.");
      return;
    }

    const titleTrimmed = formData.title.trim();
    const contentTrimmed = formData.content.trim();

    if (!titleTrimmed || !contentTrimmed) {
      setError("제목과 내용을 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let url, method;
      const data = new FormData(); // ⭐ 수정: FormData 객체 생성

      if (mode === "edit" && post) {
        // update
        const postId = post.id || post.board_id;
        url = `/api/boards/${postId}`;
        method = "PUT";

        // PUT 요청은 multipart/form-data를 백엔드가 지원해야 함
        // 여기서는 예시로 PUT도 FormData로 보냅니다.
      } else {
        // create
        url = "/api/boards";
        method = "POST";
      }

      // 텍스트 데이터 추가
      data.append("title", titleTrimmed);
      data.append("content", contentTrimmed);
      data.append("tags", formData.tags.trim());

      // ⭐ 이미지 파일 추가
      images.forEach((file, index) => {
        data.append(`image${index}`, file);
      });
      console.log("=== 프론트엔드 전송 데이터 ===");
      console.log("선택된 이미지 개수:", images.length);
      console.log("FormData 내용:");
      for (let [key, value] of data.entries()) {
        console.log(key, value);
      }
      const response = await fetch(url, {
        method: method,
        // ⭐ Content-Type 헤더는 FormData가 자동으로 설정하므로 명시하지 않음
        credentials: "include",
        body: data, // ⭐ 수정: FormData 객체 전달
      });

      if (response.ok) {
        const result = await response.json();
        onSuccess(result);
        onClose();
      } else {
        const errorData = await response.text();
        setError(`실패: ${errorData}`);
      }
    } catch (error) {
      console.error("네트워크 오류:", error);
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        className="relative bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              {mode === "edit" ? (
                <Edit className="w-5 h-5 text-white" />
              ) : (
                <Plus className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {mode === "edit" ? "게시글 수정" : "새 게시글 작성"}
              </h2>
              <p className="text-sm text-gray-400">
                {profile?.name}님의 이야기를 들려주세요
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-500/10 border border-red-400/20 rounded-lg"
          >
            <p className="text-red-300 text-sm">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              제목
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-400"
              placeholder="제목을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              내용
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none text-white placeholder-gray-400"
              placeholder="무슨 일이 있었나요? 당신의 이야기를 들려주세요..."
            />
          </div>

          {/* ⭐ 추가된 사진 업로드 섹션 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              사진 (선택사항)
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {imagePreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-600"
                >
                  <img
                    src={preview}
                    alt={`미리보기 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              <label
                htmlFor="image-upload"
                className="w-24 h-24 flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
              >
                <ImageIcon className="w-8 h-8 text-gray-400" />
                <input
                  id="image-upload"
                  type="file"
                  multiple
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              태그 (선택사항)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-400"
              placeholder="태그를 쉼표로 구분해서 입력하세요 (예: 음악,여행,일상)"
            />
            <p className="text-xs text-gray-500 mt-1">
              쉼표(,)로 구분하여 여러 태그를 입력할 수 있습니다
            </p>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
            >
              취소
            </button>
            <motion.button
              type="submit"
              disabled={
                loading || !formData.title.trim() || !formData.content.trim()
              }
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading
                ? "처리 중..."
                : mode === "edit"
                ? "수정하기"
                : "게시하기"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default PostModal;
