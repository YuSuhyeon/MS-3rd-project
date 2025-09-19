import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  TextInput,
  Textarea,
  NumberInput,
  SimpleGrid,
  Group,
  Stack,
  Title,
  Divider,
  Text,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Save, Clock, MapPin, DollarSign, Info } from "lucide-react";

export default function ActivityEditor({ activity, opened, onClose, onSave }) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [formData, setFormData] = useState(activity);

  useEffect(() => {
    if (activity) {
      setFormData(activity);
    }
  }, [activity]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  if (!activity) return null;

  const inputStyles = {
    label: {
      color: "var(--mantine-color-gray-4)",
      marginBottom: "4px",
      fontSize: "var(--mantine-font-size-sm)",
    },
    input: {
      backgroundColor: "var(--mantine-color-dark-6)",
      borderColor: "var(--mantine-color-dark-4)",
      color: "var(--mantine-color-gray-1)",
      "&:focus": {
        borderColor: "var(--mantine-color-grape-5)",
      },
    },
    icon: {
      color: "var(--mantine-color-gray-5)",
    },
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Title order={4} c="gray.1">
          활동 편집
        </Title>
      }
      size="xl"
      radius="md"
      fullScreen={isMobile}
      centered={!isMobile}
      overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
      styles={{
        content: { backgroundColor: "var(--mantine-color-dark-8)" },
        header: {
          backgroundColor: "var(--mantine-color-dark-8)",
          borderBottom: "1px solid var(--mantine-color-dark-5)",
        },
      }}
    >
      <Stack gap="xl" pt="md">
        <Stack gap="md">
          <Divider
            label={
              <Text size="xs" fw={500} c="grape.3">
                시간 정보
              </Text>
            }
            labelPosition="left"
          />
          <SimpleGrid cols={isMobile ? 1 : 2}>
            <TextInput
              label="시간"
              type="time"
              value={formData.time || ""}
              onChange={(e) => handleChange("time", e.currentTarget.value)}
              leftSection={<Clock size={16} />}
              styles={inputStyles}
            />
            <NumberInput
              label="소요시간 (분)"
              value={formData.duration || 60}
              onChange={(val) => handleChange("duration", val)}
              min={15}
              step={15}
              styles={inputStyles}
            />
          </SimpleGrid>
        </Stack>

        <Stack gap="md">
          <Divider
            label={
              <Text size="xs" fw={500} c="grape.3">
                장소 정보
              </Text>
            }
            labelPosition="left"
          />
          <SimpleGrid cols={isMobile ? 1 : 2}>
            <TextInput
              label="장소명"
              placeholder="장소명을 입력하세요"
              value={formData.place_name || ""}
              onChange={(e) =>
                handleChange("place_name", e.currentTarget.value)
              }
              leftSection={<MapPin size={16} />}
              styles={inputStyles}
            />
            <TextInput
              label="장소 유형"
              placeholder="attraction / restaurant ..."
              value={formData.place_type || ""}
              onChange={(e) =>
                handleChange("place_type", e.currentTarget.value)
              }
              leftSection={<Info size={16} />}
              styles={inputStyles}
            />
          </SimpleGrid>
        </Stack>

        <Stack gap="md">
          <Divider
            label={
              <Text size="xs" fw={500} c="grape.3">
                세부 정보
              </Text>
            }
            labelPosition="left"
          />
          <Textarea
            label="설명"
            placeholder="활동에 대한 설명을 입력하세요"
            value={formData.description || ""}
            onChange={(e) => handleChange("description", e.currentTarget.value)}
            autosize
            minRows={2}
            styles={inputStyles}
          />
          <NumberInput
            label="예상 비용 (원)"
            value={formData.cost_estimate || 0}
            onChange={(val) => handleChange("cost_estimate", val || 0)}
            min={0}
            step={1000}
            leftSection={<DollarSign size={16} />}
            styles={inputStyles}
          />
        </Stack>

        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={onClose}>
            취소
          </Button>
          <Button
            variant="gradient"
            gradient={{ from: "grape", to: "pink" }}
            onClick={handleSave}
            leftSection={<Save size={16} />}
          >
            저장
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
