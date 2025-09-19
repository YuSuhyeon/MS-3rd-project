import React from "react";
import { motion } from "framer-motion";
import {
  Paper,
  Title,
  Text,
  Button,
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

const formatCurrency = (value) =>
  (value || 0).toLocaleString("ko-KR", { maximumFractionDigits: 0 });

const formatTimestamp = (timestamp) => {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  const dateLabel = date.toLocaleDateString("ko-KR");
  const timeLabel = date
    .toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
    .replace(/:\d{2}$/u, "");
  return `${dateLabel} ${timeLabel}`;
};

const STATUS_PALETTE = {
  saving: {
    bg: "rgba(168, 85, 247, 0.16)",
    text: "var(--mantine-color-grape-2)",
    icon: "#d8b4fe",
  },
  pending: {
    bg: "rgba(249, 115, 22, 0.16)",
    text: "var(--mantine-color-orange-2)",
    icon: "#fdba74",
  },
  saved: {
    bg: "rgba(16, 185, 129, 0.16)",
    text: "var(--mantine-color-teal-2)",
    icon: "#99f6e4",
  },
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
        total + (day.activities || []).reduce((subtotal, activity) => subtotal + (activity.cost_estimate || 0), 0),
      0
    ) || 0;
  const activityCount =
    itinerary?.days?.reduce((total, day) => total + (day.activities?.length || 0), 0) || 0;

  const status = (() => {
    if (isSaving || isAutoSaving) {
      return {
        tone: "saving",
        label: "변경 사항을 저장하는 중이에요",
        icon: Sparkles,
      };
    }
    if (hasChanges) {
      return {
        tone: "pending",
        label: "저장되지 않은 변경이 있습니다",
        icon: Clock8,
      };
    }
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
        bg="dark.7"
        style={{ borderColor: "rgba(192, 132, 252, 0.2)" }}
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
                  color: "var(--mantine-color-gray-0)",
                  borderColor: "rgba(192, 132, 252, 0.28)",
                },
              }}
            />
            <Group gap="lg" wrap="wrap">
              <Text
                c="gray.4"
                size="sm"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <MapPin size={16} /> {itinerary?.destination || "목적지가 정해지지 않았어요"}
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
                color: palette.text,
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
              <Button
                variant="outline"
                color="gray"
                onClick={onDiscard}
                disabled={!hasChanges}
              >
                변경 취소
              </Button>
              <Button
                variant="gradient"
                gradient={{ from: "grape", to: "pink" }}
                onClick={onSave}
                loading={isSaving}
                disabled={!hasChanges && !isSaving}
              >
                저장
              </Button>
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
              <Text fw={700} c="grape.2" size="lg">
                {formatCurrency(totalCost)}원
              </Text>
            </Group>
          </Box>
        </Stack>
      </Paper>
    </motion.div>
  );
}
