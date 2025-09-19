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
  Button,
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

const activityIcons = {
  attraction: MapPin,
  restaurant: Utensils,
  accommodation: Bed,
  transport: Car,
  activity: Ticket,
  shopping: Camera,
};

export default function TimelineDay({
  day,
  dayIndex,
  onEditActivity,
  onAddActivity,
  onDeleteActivity,
}) {
  const isMobile = useMediaQuery("(max-width: 767px)");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: dayIndex * 0.1 }}
    >
      <Group mb="lg">
        <Avatar color="grape" size="lg" radius="xl">
          {day.day_number}
        </Avatar>
        <Box>
          <Title order={isMobile ? 4 : 3} c="gray.1">
            {day.day_number === 1
              ? "첫째"
              : day.day_number === 2
              ? "둘째"
              : "셋째"}{" "}
            날
          </Title>
          <Text size="sm" c="gray.5">
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
        color="grape"
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
                      bg="dark.8"
                      shadow={snapshot.isDragging ? "lg" : "xs"}
                      style={{
                        transition:
                          "box-shadow 0.2s ease, border-color 0.2s ease",
                        marginLeft: 10,
                        borderColor: snapshot.isDragging
                          ? "var(--mantine-color-grape-5)"
                          : "rgba(192, 132, 252, 0.2)",
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
                              <Badge variant="light" color="grape">
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
                          <Title order={5} mt="xs" c="gray.1" truncate>
                            {activity.place_name}
                          </Title>
                          {activity.description && (
                            <Text size="sm" mt={4} c="gray.5" truncate>
                              {activity.description}
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

      <Button
        fullWidth
        variant="outline"
        color="gray.7"
        mt="md"
        leftSection={<Plus size={16} />}
        onClick={() => onAddActivity(day.activities.length)}
      >
        활동 추가
      </Button>
    </motion.div>
  );
}
