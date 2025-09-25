import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

// 1. 메인 배경 (물결 효과 추가)
export const BackgroundEffect = ({ children, className = "" }) => {
  const canvasRef = useRef(null);

  const useIsMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkIsMobile = () => {
        if (typeof window !== "undefined") {
          const width = window.innerWidth;
          setIsMobile(width < breakpoint);
        }
      };

      checkIsMobile();

      if (typeof window !== "undefined") {
        window.addEventListener("resize", checkIsMobile);
        return () => window.removeEventListener("resize", checkIsMobile);
      }
    }, [breakpoint]);

    return isMobile;
  };

  const isMobile = useIsMobile();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationId;
    let time = 0;
    let mouseX = 0;
    let mouseY = 0;

    // 캔버스 크기 설정
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // 마우스 위치 추적
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    // 물결 애니메이션 함수
    const drawWaves = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 다중 물결 레이어
      const waves = [
        {
          amplitude: 40,
          frequency: 0.005,
          speed: 0.01,
          color: "rgba(168, 85, 247, 0.1)", // purple
          yOffset: canvas.height * 0.3,
        },
        {
          amplitude: 60,
          frequency: 0.003,
          speed: 0.008,
          color: "rgba(236, 72, 153, 0.08)", // pink
          yOffset: canvas.height * 0.5,
        },
        {
          amplitude: 30,
          frequency: 0.007,
          speed: 0.012,
          color: "rgba(59, 130, 246, 0.06)", // blue
          yOffset: canvas.height * 0.7,
        },
      ];

      waves.forEach((wave, index) => {
        ctx.beginPath();
        ctx.fillStyle = wave.color;

        // 마우스 인터랙션 효과
        const mouseInfluence = Math.sin(mouseX * 0.001) * 20;
        const mouseVertical = (mouseY / canvas.height - 0.5) * 100;

        // 물결 경로 생성
        ctx.moveTo(0, canvas.height);

        for (let x = 0; x <= canvas.width; x += 5) {
          const y =
            wave.yOffset +
            Math.sin(x * wave.frequency + time * wave.speed) * wave.amplitude +
            Math.sin(x * 0.01 + time * 0.005) * 15 +
            mouseInfluence * Math.sin(x * 0.002) +
            mouseVertical * 0.1;

          ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();
      });

      time += 1;
      animationId = requestAnimationFrame(drawWaves);
    };

    // 초기화
    resizeCanvas();
    drawWaves();

    // 이벤트 리스너
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);

    // 클린업
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  if (isMobile) {
    return (
      <div
        className={`relative bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white overflow-hidden ${className}`}
      >
        {/* 물결 캔버스 */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{ zIndex: 1 }}
        />

        {/* 기존 별 배경 효과 */}
        <div
          className="fixed inset-0 opacity-30 pointer-events-none"
          style={{ zIndex: 2 }}
        >
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* 추가 파티클 효과 */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: 2 }}
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `linear-gradient(45deg, 
                  rgba(168, 85, 247, 0.6), 
                  rgba(236, 72, 153, 0.4)
                )`,
                filter: "blur(1px)",
              }}
              animate={{
                y: [-20, -100],
                opacity: [0, 1, 0],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 4,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* 컨텐츠 */}
        <div className="relative z-10">{children}</div>
      </div>
    );
  } else {
    return (
      <div
        className={`relative min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white overflow-hidden ${className}`}
      >
        {/* 물결 캔버스 */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{ zIndex: 1 }}
        />

        {/* 기존 별 배경 효과 */}
        <div
          className="fixed inset-0 opacity-30 pointer-events-none"
          style={{ zIndex: 2 }}
        >
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* 추가 파티클 효과 */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: 2 }}
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `linear-gradient(45deg, 
                  rgba(168, 85, 247, 0.6), 
                  rgba(236, 72, 153, 0.4)
                )`,
                filter: "blur(1px)",
              }}
              animate={{
                y: [-20, -100],
                opacity: [0, 1, 0],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 4,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* 컨텐츠 */}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
};

// 물결 효과만 따로 사용할 수 있는 컴포넌트
export const WaveEffect = ({
  className = "",
  waveColors = [
    "rgba(168, 85, 247, 0.1)", // purple
    "rgba(236, 72, 153, 0.08)", // pink
    "rgba(59, 130, 246, 0.06)", // blue
  ],
  interactive = true,
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationId;
    let time = 0;
    let mouseX = 0;
    let mouseY = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      if (!interactive) return;
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const drawWaves = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const waves = [
        {
          amplitude: 50,
          frequency: 0.004,
          speed: 0.015,
          color: waveColors,
          yOffset: canvas.height * 0.2,
        },
        {
          amplitude: 70,
          frequency: 0.003,
          speed: 0.01,
          color: waveColors[1],
          yOffset: canvas.height * 0.4,
        },
        {
          amplitude: 40,
          frequency: 0.006,
          speed: 0.018,
          color: waveColors[2],
          yOffset: canvas.height * 0.6,
        },
      ];

      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.fillStyle = wave.color;

        const mouseInfluence = interactive
          ? Math.sin(mouseX * 0.001 + time * 0.01) * 25
          : 0;
        const mouseVertical = interactive
          ? (mouseY / canvas.height - 0.5) * 80
          : 0;

        ctx.moveTo(0, canvas.height);

        for (let x = 0; x <= canvas.width; x += 3) {
          const y =
            wave.yOffset +
            Math.sin(x * wave.frequency + time * wave.speed) * wave.amplitude +
            Math.sin(x * 0.008 + time * 0.003) * 20 +
            mouseInfluence * Math.sin(x * 0.003) +
            mouseVertical * Math.sin(x * 0.001) * 0.2;

          ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();
      });

      time += 1;
      animationId = requestAnimationFrame(drawWaves);
    };

    resizeCanvas();
    drawWaves();

    window.addEventListener("resize", resizeCanvas);
    if (interactive) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
      if (interactive) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [waveColors, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
    />
  );
};

// 2. 카드
export const NeonCard = ({
  icon,
  title,
  children,
  delay = 0.2,
  className = "",
  variant = "default", // default, primary, success, warning, danger
  ...props
}) => {
  const variants = {
    default:
      "border-purple-500/30 hover:border-pink-500/50 hover:shadow-pink-500/20",
    primary:
      "border-blue-500/30 hover:border-cyan-500/50 hover:shadow-cyan-500/20",
    success:
      "border-green-500/30 hover:border-emerald-500/50 hover:shadow-emerald-500/20",
    warning:
      "border-yellow-500/30 hover:border-orange-500/50 hover:shadow-orange-500/20",
    danger:
      "border-red-500/30 hover:border-rose-500/50 hover:shadow-rose-500/20",
  };

  const iconVariants = {
    default: "from-purple-500 to-pink-500",
    primary: "from-blue-500 to-cyan-500",
    success: "from-green-500 to-emerald-500",
    warning: "from-yellow-500 to-orange-500",
    danger: "from-red-500 to-rose-500",
  };

  return (
    <motion.div
      className={`relative bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-lg
                  border ${variants[variant]} rounded-2xl p-6 shadow-2xl
                  hover:shadow-2xl transition-all duration-300 ${className}`}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -5, scale: 1.02 }}
      {...props}
    >
      {/* 네온 글로우 효과 */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10 rounded-2xl blur-xl" />

      <div className="relative z-10">
        {(icon || title) && (
          <motion.div
            className="flex items-center gap-3 mb-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: delay + 0.2 }}
          >
            {icon && (
              <div
                className={`p-2 rounded-lg bg-gradient-to-r ${iconVariants[variant]}`}
              >
                {React.cloneElement(icon, {
                  className: "text-white",
                  size: 20,
                })}
              </div>
            )}
            {title && (
              <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {title}
              </h2>
            )}
          </motion.div>
        )}
        {/* 내용 */}
        <div className="space-y-2 text-gray-100">{children}</div>
      </div>
    </motion.div>
  );
};

// 2. 네온 카드_jh
export const NeonCardJH = ({
  icon,
  title,
  children,
  delay = 0.2,
  className = "",
  variant = "default", // default, primary, success, warning, danger
  ...props
}) => {
  const variants = {
    default:
      "border-purple-500/30 hover:border-pink-500/50 hover:shadow-pink-500/20",
    primary:
      "border-blue-500/30 hover:border-cyan-500/50 hover:shadow-cyan-500/20",
    success:
      "border-green-500/30 hover:border-emerald-500/50 hover:shadow-emerald-500/20",
    warning:
      "border-yellow-500/30 hover:border-orange-500/50 hover:shadow-orange-500/20",
    danger:
      "border-red-500/30 hover:border-rose-500/50 hover:shadow-rose-500/20",
  };

  const iconVariants = {
    default: "from-purple-500 to-pink-500",
    primary: "from-blue-500 to-cyan-500",
    success: "from-green-500 to-emerald-500",
    warning: "from-yellow-500 to-orange-500",
    danger: "from-red-500 to-rose-500",
  };

  return (
    <motion.div
      className={`relative bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-lg pb-0
                  border ${variants[variant]} rounded-2xl p-6 shadow-2xl
                  hover:shadow-2xl transition-all duration-300 ${className}`}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -5, scale: 1.02 }}
      {...props}
    >
      {/* 네온 글로우 효과 */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10 rounded-2xl blur-xl" />

      <div className="relative z-10 h-full">
        {(icon || title) && (
          <motion.div
            className="flex items-center gap-3 mb-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: delay + 0.2 }}
          >
            {icon && (
              <div
                className={`p-2 rounded-lg bg-gradient-to-r ${iconVariants[variant]}`}
              >
                {React.cloneElement(icon, {
                  className: "text-white",
                  size: 20,
                })}
              </div>
            )}
            {title && (
              <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {title}
              </h2>
            )}
          </motion.div>
        )}
        {/* 내용 */}
        <div className="space-y-2 text-gray-100 h-full">{children}</div>
      </div>
    </motion.div>
  );
};

// 2. 네온 카드_jh mobile
export const NeonCardJHMobile = ({
  icon,
  title,
  children,
  delay = 0.2,
  className = "",
  variant = "default", // default, primary, success, warning, danger
  ...props
}) => {
  const variants = {
    default:
      "border-purple-500/30 hover:border-pink-500/50 hover:shadow-pink-500/20",
    primary:
      "border-blue-500/30 hover:border-cyan-500/50 hover:shadow-cyan-500/20",
    success:
      "border-green-500/30 hover:border-emerald-500/50 hover:shadow-emerald-500/20",
    warning:
      "border-yellow-500/30 hover:border-orange-500/50 hover:shadow-orange-500/20",
    danger:
      "border-red-500/30 hover:border-rose-500/50 hover:shadow-rose-500/20",
  };

  const iconVariants = {
    default: "from-purple-500 to-pink-500",
    primary: "from-blue-500 to-cyan-500",
    success: "from-green-500 to-emerald-500",
    warning: "from-yellow-500 to-orange-500",
    danger: "from-red-500 to-rose-500",
  };

  return (
    <motion.div
      className={`relative bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-lg
                  border ${variants[variant]} rounded-2xl p-6 shadow-2xl
                  hover:shadow-2xl transition-all duration-300 h-full ${className}`}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -5, scale: 1.02 }}
      {...props}
    >
      {/* 네온 글로우 효과 */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10 rounded-2xl blur-xl" />

      <div className="relative z-10 h-full">
        {(icon || title) && (
          <motion.div
            className="flex items-center gap-3 mb-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: delay + 0.2 }}
          >
            {icon && (
              <div
                className={`p-2 rounded-lg bg-gradient-to-r ${iconVariants[variant]}`}
              >
                {React.cloneElement(icon, {
                  className: "text-white",
                  size: 20,
                })}
              </div>
            )}
            {title && (
              <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {title}
              </h2>
            )}
          </motion.div>
        )}
        {/* 내용 */}
        <div className="space-y-2 text-gray-100 h-full">{children}</div>
      </div>
    </motion.div>
  );
};
// 3. 그라데이션 텍스트 효과
export const GradientText = ({
  children,
  variant = "primary",
  size = "base",
  className = "",
  style = {},
  dynamic,
  ...props
}) => {
  const variants = {
    primary: "from-purple-300 to-pink-300",
    secondary: "from-white to-gray-300",
    accent: "from-cyan-300 to-blue-300",
    success: "from-green-300 to-emerald-300",
    warning: "from-yellow-300 to-orange-300",
    danger: "from-red-300 to-rose-300",
  };

  const sizes = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl",
    "5xl": "text-5xl",
    "6xl": "text-6xl",
  };

  return (
    <span
      style={style}
      className={`font-bold bg-gradient-to-r ${variants[variant]} bg-clip-text text-transparent ${sizes[size]} ${className}`}
      dynamic={dynamic}
      {...props}
    >
      {children}
    </span>
  );
};

// 4. 네온 버튼
export const NeonButton = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
}) => {
  const variants = {
    primary:
      "from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-purple-500/25",
    secondary:
      "from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 shadow-gray-500/25",
    success:
      "from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-green-500/25",
    warning:
      "from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-yellow-500/25",
    danger:
      "from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-red-500/25",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    xl: "px-8 py-4 text-xl",
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-gradient-to-r ${variants[variant]}
        ${sizes[size]}
        font-semibold text-white rounded-xl
        shadow-lg hover:shadow-xl
        transform transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      {children}
    </motion.button>
  );
};

// 5. 히어로 이미지 섹션
export const HeroSection = ({
  title,
  subtitle,
  description,
  backgroundImage,
  children,
  height = "h-96",
}) => (
  <motion.div
    className={`relative ${height} mb-8 rounded-3xl overflow-hidden`}
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.8 }}
  >
    {/* 배경 이미지 */}
    {backgroundImage && (
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
    )}

    {/* 그라데이션 오버레이 */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
    <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-transparent to-pink-900/30" />

    {/* 컨텐츠 */}
    <div className="absolute bottom-0 left-0 right-0 p-8">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {subtitle && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-pink-400 font-medium">{subtitle}</span>
          </div>
        )}

        {title && (
          <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            {title}
          </h1>
        )}

        {description && (
          <p className="text-gray-300 text-lg md:text-xl max-w-3xl leading-relaxed">
            {description}
          </p>
        )}

        {children}
      </motion.div>
    </div>

    {/* 네온 테두리 효과 */}
    <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-blue-500/50 bg-clip-border blur-sm" />
  </motion.div>
);

// 6. 로딩 아이콘 효과
export const NeonLoader = ({ size = "md" }) => {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={`${sizes[size]} border-4 border-purple-400 border-t-pink-400 rounded-full`}
      />
    </div>
  );
};

// 7. 스크롤바
export const NeonScrollbarStyles = () => (
  <style jsx global>{`
    .neon-scrollbar::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }
    .neon-scrollbar::-webkit-scrollbar-track {
      background: rgba(109, 109, 109, 0.2);
      border-radius: 2px;
    }
    .neon-scrollbar::-webkit-scrollbar-thumb {
      background: linear-gradient(to bottom, #a855f7, #ec4899);
      border-radius: 2px;
    }
    .neon-scrollbar::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(to bottom, #9333ea, #db2777);
    }

    /* Firefox */
    .neon-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #a855f7 rgba(109, 109, 109, 0.2);
    }
  `}</style>
);

// 8. 반응형 그리드 컨테이너
export const ResponsiveGrid = ({ children, className = "" }) => (
  <div
    className={`grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${className}`}
  >
    {children}
  </div>
);

// 9. 네온 네비게이션 링크
export const NeonNavLink = ({ to, children, icon }) => (
  <motion.div
    className="inline-flex items-center gap-2 text-purple-300 hover:text-pink-300 
               font-semibold transition-colors duration-300 group cursor-pointer"
    whileHover={{ x: -5 }}
  >
    {icon &&
      React.cloneElement(icon, {
        size: 20,
        className: "group-hover:-translate-x-1 transition-transform",
      })}
    {children}
  </motion.div>
);

// 10. 데이터 디스플레이 컴포넌트
export const DataDisplay = ({
  value,
  label,
  variant = "primary",
  size = "lg",
}) => {
  const variants = {
    primary: "from-purple-300 to-pink-300",
    success: "from-green-300 to-emerald-300",
    warning: "from-orange-400 to-yellow-400",
    info: "from-sky-300 to-blue-300",
  };

  const sizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
    xl: "text-5xl",
  };

  return (
    <div>
      <motion.p
        className={`${sizes[size]} font-black bg-gradient-to-r ${variants[variant]} bg-clip-text text-transparent`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        {value}
      </motion.p>
      {label && <p className="text-lg text-gray-300 mt-1">{label}</p>}
    </div>
  );
};
