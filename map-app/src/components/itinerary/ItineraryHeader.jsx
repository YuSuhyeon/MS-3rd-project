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
  Progress,
  Box,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  Calendar,
  MapPin,
  DollarSign,
  Sparkles,
  Share2,
  Save,
} from "lucide-react";

export default function ItineraryHeader({
  itinerary,
  onRegenerate,
  isGenerating,
}) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const totalCost =
    itinerary?.days?.reduce(
      (total, day) =>
        total + day.activities.reduce((d, a) => d + (a.cost_estimate || 0), 0),
      0
    ) || 0;
  const activityCount =
    itinerary?.days?.reduce((total, day) => total + day.activities.length, 0) ||
    0;

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
        radius="md"
        withBorder
        bg="dark.7"
        style={{ borderColor: "rgba(192, 132, 252, 0.2)" }}
      >
        <Stack>
          <Group justify="space-between" align="start">
            <Stack gap={4}>
              <Title
                order={isMobile ? 3 : 1}
                variant="gradient"
                gradient={{ from: "grape", to: "pink", deg: 45 }}
              >
                {itinerary.itinerary_name || "나의 여행 일정"}
              </Title>
              <Group mt="sm" gap="lg">
                <Text
                  c="gray.4"
                  size="sm"
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <MapPin size={16} /> {itinerary.destination || "목적지"}
                </Text>
                {!isMobile && (
                  <Text
                    c="gray.4"
                    size="sm"
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <Calendar size={16} /> {itinerary.total_days || 0}일 여행
                  </Text>
                )}
                <Badge
                  variant="light"
                  color="grape"
                  leftSection={<Sparkles size={12} />}
                >
                  {activityCount}개 활동
                </Badge>
              </Group>
            </Stack>
            <Group>
              <Button variant="default" p={isMobile ? 8 : undefined}>
                <Share2 size={16} />{" "}
                <Text visibleFrom="sm" ml={8}>
                  공유
                </Text>
              </Button>
              <Button
                variant="gradient"
                gradient={{ from: "grape", to: "pink" }}
                p={isMobile ? 8 : undefined}
              >
                <Save size={16} />{" "}
                <Text visibleFrom="sm" ml={8}>
                  저장
                </Text>
              </Button>
            </Group>
          </Group>

          <Box mt="md">
            <Group justify="space-between">
              <Text
                size="sm"
                fw={500}
                c="gray.4"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <DollarSign size={16} /> 예상 총 비용
              </Text>
              <Text fw={700} c="grape.2" size="lg">
                {totalCost.toLocaleString()}원
              </Text>
            </Group>
            {!isMobile && (
              <Progress value={45} color="grape" mt={4} radius="sm" />
            )}
          </Box>
        </Stack>
      </Paper>
    </motion.div>
  );
}
