import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Timeline,
  Text,
  Paper,
  Group,
  Badge,
  Avatar,
  Title,
  ActionIcon,
  Flex,
  Box,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  MapPin,
  Clock,
  Plus,
  Edit,
  Trash2,
  Camera,
  Utensils,
  Bed,
  Car,
  Ticket,
  GripVertical,
} from "lucide-react";
import { NeonButton, GradientText } from "components/ui/NeonTheme";
import { useTranslation } from "react-i18next";

const activityIcons = {
  attraction: MapPin,
  restaurant: Utensils,
  accommodation: Bed,
  transport: Car,
  activity: Ticket,
  shopping: Camera,
};

const dayLabel = (dayNumber) => {
  const labels = ["첫째", "둘째", "셋째", "넷째", "다섯째"];
  return labels[dayNumber - 1] || `${dayNumber}일차`;
};

export default function TimelineDay({
  day,
  dayIndex,
  onEditActivity,
  onAddActivity,
  onDeleteActivity,
  onSelectDay,
  isActive = false,
}) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const { t } = useTranslation("planner");
  const handleSelectDay = () => {
    if (typeof onSelectDay === "function") {
      onSelectDay(dayIndex);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: dayIndex * 0.1 }}
    >
      <Group
        mb="lg"
        align="center"
        onClick={handleSelectDay}
        style={{ cursor: "pointer" }}
      >
        <Avatar
          color={isActive ? "grape" : "gray"}
          size="lg"
          radius="xl"
          styles={{
            root: isActive
              ? { boxShadow: "0 0 10px var(--mantine-color-grape-5)" }
              : {},
          }}
        >
          {day.day_number}
        </Avatar>
        <Box>
          <Title order={isMobile ? 4 : 3}>
            <GradientText dynamic="true">{dayLabel(day.day_number)} 날</GradientText>
          </Title>
          <Text size="sm" c="gray.5" dynamic="true">
            {day.date
              ? format(new Date(day.date), "yyyy년 M월 d일")
              : "날짜 미정"}
          </Text>
        </Box>
      </Group>

      <Timeline
        active={day.activities.length}
        bulletSize={24}
        lineWidth={2}
        color={isActive ? "grape" : "gray"}
        style={{ paddingBottom: "var(--mantine-spacing-sm)" }}
      >
        {day.activities?.map((activity, activityIndex) => {
          const IconComponent = activityIcons[activity.place_type] || MapPin;
          return (
            <Draggable
              key={activity.id}
              draggableId={String(activity.id)}
              index={activityIndex}
            >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  style={{ ...provided.draggableProps.style, outline: "none" }}
                >
                  <Timeline.Item
                    bullet={<IconComponent size={14} />}
                    title=""
                    pb="xl"
                  >
                    <Paper
                      className="group"
                      p="md"
                      radius="md"
                      withBorder
                      shadow={snapshot.isDragging ? "lg" : "xs"}
                      style={{
                        marginLeft: 10,
                        backgroundColor: "rgba(10, 5, 20, 0.7)",
                        borderColor: snapshot.isDragging
                          ? "rgba(236, 72, 153, 0.8)"
                          : isActive
                          ? "rgba(168, 85, 247, 0.6)"
                          : "rgba(168, 85, 247, 0.2)",
                        backdropFilter: "blur(8px)",
                        transition:
                          "box-shadow 0.2s ease, border-color 0.2s ease",
                        boxShadow: snapshot.isDragging
                          ? "0 0 15px rgba(236, 72, 153, 0.5)"
                          : "none",
                      }}
                    >
                      <Flex align="center">
                        <ActionIcon
                          {...provided.dragHandleProps}
                          variant="transparent"
                          color="gray.5"
                          mr="sm"
                          p={8}
                        >
                          <GripVertical size={20} />
                        </ActionIcon>
                        <Box style={{ flex: 1, overflow: "hidden" }}>
                          <Group justify="space-between" wrap="nowrap">
                            <Group gap="xs" wrap="nowrap">
                              <Badge
                                variant="light"
                                color={isActive ? "grape" : "gray"}
                                styles={{
                                  root: {
                                    backgroundColor: "rgba(168, 85, 247, 0.15)",
                                    color: "#d8b4fe",
                                  },
                                }}
                              >
                                {activity.place_type}
                              </Badge>
                              <Text
                                size="sm"
                                c="grape.2"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <Clock size={14} />
                                {activity.time}
                                {activity.duration &&
                                  ` (${activity.duration}분)`}
                              </Text>
                            </Group>
                            <Group
                              gap="xs"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              wrap="nowrap"
                            >
                              <ActionIcon
                                variant="light"
                                color="blue"
                                onClick={() => onEditActivity(activity)}
                              >
                                <Edit size={16} />
                              </ActionIcon>
                              <ActionIcon
                                variant="light"
                                color="red"
                                onClick={() => onDeleteActivity(activity.id)}
                              >
                                <Trash2 size={16} />
                              </ActionIcon>
                            </Group>
                          </Group>
                          <Title order={5} mt="xs" c="gray.1" truncate dynamic="true">
                            {activity.place_name}
                          </Title>
                          {(activity.description || activity.address) && (
                            <Text size="sm" mt={4} c="gray.5" truncate dynamic="true">
                              {activity.description || activity.address}
                            </Text>
                          )}
                        </Box>
                      </Flex>
                    </Paper>
                  </Timeline.Item>
                </div>
              )}
            </Draggable>
          );
        })}
      </Timeline>

      <Box mt="md">
        <NeonButton
          fullWidth
          variant={isActive ? "primary" : "secondary"}
          leftSection={<Plus size={16} />}
          onClick={() => onAddActivity(day.activities.length)}
        >
          {t("add_activity")}
        </NeonButton>
      </Box>
    </motion.div>
  );
}
