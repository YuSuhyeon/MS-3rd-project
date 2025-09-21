import React from "react";
import { motion } from "framer-motion";
import {
  Paper,
  Text,
  Group,
  Stack,
  Badge,
  Box,
  TextInput,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  Calendar,
  MapPin,
  DollarSign,
  Sparkles,
  Check,
  Clock8,
} from "lucide-react";
import { NeonButton, GradientText } from "components/ui/NeonTheme";

const formatCurrency = (value) =>
  (value || 0).toLocaleString("ko-KR", { maximumFractionDigits: 0 });

const formatTimestamp = (timestamp) => {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  return `${date.toLocaleDateString("ko-KR")} ${date
    .toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
    .replace(/:\d{2}$/u, "")}`;
};

const STATUS_PALETTE = {
  saving: { bg: "rgba(168, 85, 247, 0.16)", text: "#d8b4fe", icon: "#e9d5ff" },
  pending: { bg: "rgba(249, 115, 22, 0.16)", text: "#fdba74", icon: "#fed7aa" },
  saved: { bg: "rgba(16, 185, 129, 0.16)", text: "#99f6e4", icon: "#ccfbf1" },
};

export default function ItineraryHeader({
  itinerary,
  hasChanges,
  isSaving,
  isAutoSaving,
  lastSavedAt,
  onTitleChange,
  onSave,
  onDiscard,
}) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const totalCost =
    itinerary?.days?.reduce(
      (total, day) =>
        total +
        (day.activities || []).reduce(
          (subtotal, activity) => subtotal + (activity.cost_estimate || 0),
          0
        ),
      0
    ) || 0;
  const activityCount =
    itinerary?.days?.reduce(
      (total, day) => total + (day.activities?.length || 0),
      0
    ) || 0;

  const status = (() => {
    if (isSaving || isAutoSaving)
      return {
        tone: "saving",
        label: "변경 사항을 저장하는 중이에요",
        icon: Sparkles,
      };
    if (hasChanges)
      return {
        tone: "pending",
        label: "저장되지 않은 변경이 있습니다",
        icon: Clock8,
      };
    const formatted = formatTimestamp(lastSavedAt);
    return {
      tone: "saved",
      label: formatted ? `${formatted} 저장됨` : "방금 저장했습니다",
      icon: Check,
    };
  })();

  const palette = STATUS_PALETTE[status.tone];
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        marginBottom: isMobile
          ? "var(--mantine-spacing-md)"
          : "var(--mantine-spacing-xl)",
      }}
    >
      <Paper
        shadow="md"
        p={isMobile ? "md" : "xl"}
        radius="lg"
        withBorder
        style={{
          backgroundColor: "rgba(10, 5, 20, 0.7)",
          borderColor: "rgba(168, 85, 247, 0.3)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 0 25px rgba(168, 85, 247, 0.2)",
        }}
      >
        <Stack gap="lg">
          <Stack gap="xs">
            <TextInput
              value={itinerary?.itinerary_name || ""}
              onChange={(event) => onTitleChange?.(event.currentTarget.value)}
              size={isMobile ? "md" : "lg"}
              styles={{
                input: {
                  fontWeight: 700,
                  fontSize: isMobile ? "1.15rem" : "1.6rem",
                  backgroundColor: "transparent",
                  color: "#f9fafb",
                  border: "none",
                  borderBottom: "1px solid rgba(168, 85, 247, 0.3)",
                  borderRadius: 0,
                  paddingLeft: 0,
                  transition: "border-color 200ms ease",
                  "&:focus": {
                    borderColor: "rgba(236, 72, 153, 0.8)",
                  },
                },
              }}
            />
            <Group gap="lg" wrap="wrap">
              <Text
                c="gray.4"
                size="sm"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <MapPin size={16} /> {itinerary?.destination || "목적지 미정"}
              </Text>
              {!isMobile && (
                <Text
                  c="gray.4"
                  size="sm"
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <Calendar size={16} /> 총 {itinerary?.total_days || 0}일 여행
                </Text>
              )}
              <Badge
                variant="light"
                color="grape"
                leftSection={<Sparkles size={12} />}
                styles={{
                  root: {
                    backgroundColor: "rgba(168, 85, 247, 0.15)",
                    color: "#d8b4fe",
                  },
                }}
              >
                {activityCount}개의 활동
              </Badge>
            </Group>
          </Stack>

          <Group justify="space-between" align="center">
            <Box
              px="sm"
              py={6}
              style={{
                backgroundColor: palette.bg,
                borderRadius: "var(--mantine-radius-md)",
                display: "flex",
                alignItems: "center",
                gap: "var(--mantine-spacing-xs)",
              }}
            >
              <StatusIcon size={14} color={palette.icon} />
              <Text size="sm" fw={500} c={palette.text}>
                {status.label}
              </Text>
            </Box>
            <Group gap="sm">
              <NeonButton
                size="sm"
                variant="secondary"
                onClick={onDiscard}
                disabled={!hasChanges}
              >
                변경 취소
              </NeonButton>
              <NeonButton
                size="sm"
                onClick={onSave}
                loading={isSaving}
                disabled={!hasChanges && !isSaving}
              >
                저장
              </NeonButton>
            </Group>
          </Group>

          <Box mt="md">
            <Group justify="space-between" align="center">
              <Text
                size="sm"
                fw={500}
                c="gray.4"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <DollarSign size={16} /> 예상 총 비용
              </Text>
              <Text fw={700} size="lg">
                <GradientText>{formatCurrency(totalCost)}원</GradientText>
              </Text>
            </Group>
          </Box>
        </Stack>
      </Paper>
    </motion.div>
  );
}
