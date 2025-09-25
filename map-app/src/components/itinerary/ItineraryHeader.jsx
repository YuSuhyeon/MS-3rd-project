import React, { useEffect, useState } from "react";
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
import { useTranslation } from "react-i18next";
import { translateText } from "../../integrations/translator";

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
  onTitleDraftChange,
  onTitleCommit,
  onTitleEditingChange,
  onSave,
  onDiscard,
}) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const { i18n, t } = useTranslation("planner");
  const [draftTitle, setDraftTitle] = useState(itinerary?.itinerary_name || "");
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [translatedDestination, setTranslatedDestination] = useState(itinerary?.destination || "목적지 미정");
  const [translatedTitle, setTranslatedTitle] = useState(itinerary?.itinerary_name || "");

  useEffect(() => {
    if (isTitleFocused) return;
    const nextTitle = itinerary?.itinerary_name || "";
    setDraftTitle(nextTitle);
    onTitleDraftChange?.(nextTitle);
  }, [itinerary?.itinerary_name, isTitleFocused, onTitleDraftChange]);

  // destination 번역
  useEffect(() => {
    const translateDestination = async () => {
      if (!itinerary?.destination || i18n.language === 'ko') {
        setTranslatedDestination(itinerary?.destination || "목적지 미정");
        return;
      }
      
      try {
        const translated = await translateText(itinerary.destination, i18n.language);
        setTranslatedDestination(translated || itinerary.destination);
      } catch (error) {
        console.error('Failed to translate destination:', error);
        setTranslatedDestination(itinerary.destination);
      }
    };
    
    translateDestination();
  }, [itinerary?.destination, i18n.language]);

  // title 번역
  useEffect(() => {
    const translateTitle = async () => {
      if (!itinerary?.itinerary_name || i18n.language === 'ko') {
        setTranslatedTitle(itinerary?.itinerary_name || "");
        return;
      }
      
      try {
        const translated = await translateText(itinerary.itinerary_name, i18n.language);
        setTranslatedTitle(translated || itinerary.itinerary_name);
      } catch (error) {
        console.error('Failed to translate title:', error);
        setTranslatedTitle(itinerary.itinerary_name);
      }
    };
    
    translateTitle();
  }, [itinerary?.itinerary_name, i18n.language]);
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
              value={isTitleFocused ? draftTitle : translatedTitle}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setDraftTitle(value);
                onTitleDraftChange?.(value);
              }}
              onFocus={() => {
                setIsTitleFocused(true);
                onTitleEditingChange?.(true);
              }}
              size={isMobile ? "md" : "lg"}
              dynamic="true"
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
              onBlur={(event) => {
                setIsTitleFocused(false);
                onTitleEditingChange?.(false);
                onTitleCommit?.(event.currentTarget.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  setIsTitleFocused(false);
                  onTitleEditingChange?.(false);
                  event.currentTarget.blur();
                }
              }}
            />
            <Group gap="lg" wrap="wrap">
              <Text
                c="gray.4"
                size="sm"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <MapPin size={16} /> {translatedDestination}
              </Text>
              {!isMobile && (
                <Text
                  c="gray.4"
                  size="sm"
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <Calendar size={16} /> {t("total_days_travel", { days: itinerary?.total_days || 0 })}
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
                <span dynamic="true">{activityCount}개의 활동</span>
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
              <Text size="sm" fw={500} c={palette.text} dynamic="true">
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
                <span dynamic="true">변경 취소</span>
              </NeonButton>
              <NeonButton
                size="sm"
                onClick={onSave}
                loading={isSaving}
                disabled={!hasChanges && !isSaving}
              >
                <span dynamic="true">저장</span>
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
                <DollarSign size={16} /> <span dynamic="true">예상 총 비용</span>
              </Text>
              <Text fw={700} size="lg">
                <GradientText dynamic="true">{formatCurrency(totalCost)}원</GradientText>
              </Text>
            </Group>
          </Box>
        </Stack>
      </Paper>
    </motion.div>
  );
}
