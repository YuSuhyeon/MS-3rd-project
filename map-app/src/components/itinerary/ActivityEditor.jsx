import React, { useState, useEffect, useMemo } from "react";
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
  Input,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Save, Clock, MapPin, DollarSign, Info } from "lucide-react";
import PlaceSearchInput from "components/directions/PlaceSearchInput";

const categoryCodeMap = {
  FD6: "restaurant",
  CE7: "cafe",
  AT4: "attraction",
  AD5: "transport",
  HP8: "accommodation",
  MT1: "shopping",
};

const deepClone = (value) => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
};

export default function ActivityEditor({ activity, opened, onClose, onSave }) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [formData, setFormData] = useState(activity);
  const [placeQuery, setPlaceQuery] = useState(activity?.place_name || "");

  useEffect(() => {
    if (activity) {
      setFormData(deepClone(activity));
      setPlaceQuery(activity.place_name || "");
    }
  }, [activity]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePlaceSelect = (place) => {
    if (!place) return;
    setPlaceQuery(place.name || "");
    setFormData((prev) => ({
      ...prev,
      place_name: place.name || prev.place_name,
      address: place.address || prev.address || "",
      roadAddress: place.roadAddress || prev.roadAddress || "",
      lat: typeof place.lat === "number" ? place.lat : prev.lat ?? null,
      lng: typeof place.lng === "number" ? place.lng : prev.lng ?? null,
      place_type:
        prev.place_type && prev.place_type.trim().length > 0
          ? prev.place_type
          : categoryCodeMap[place.categoryGroupCode] || "activity",
    }));
  };

  const inputStyles = useMemo(
    () => ({
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
    }),
    []
  );

  if (!activity) return null;

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
              label="체류 시간 (분)"
              value={formData.duration ?? 60}
              onChange={(val) => handleChange("duration", Number(val) || 0)}
              min={0}
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
          <Input.Wrapper label="장소명" styles={inputStyles}>
            <PlaceSearchInput
              value={placeQuery}
              onChange={(value) => {
                setPlaceQuery(value);
                handleChange("place_name", value);
                if (!value) {
                  handleChange("lat", null);
                  handleChange("lng", null);
                  handleChange("address", "");
                  handleChange("roadAddress", "");
                }
              }}
              onSelect={handlePlaceSelect}
              placeholder="검색어를 입력하면 장소를 추천해드려요"
              className="itinerary-place-input"
            />
          </Input.Wrapper>
          <SimpleGrid cols={isMobile ? 1 : 2}>
            <TextInput
              label="장소 유형"
              placeholder="attraction / restaurant ..."
              value={formData.place_type || ""}
              onChange={(e) => handleChange("place_type", e.currentTarget.value)}
              leftSection={<Info size={16} />}
              styles={inputStyles}
            />
            <TextInput
              label="도로명 주소"
              value={formData.roadAddress || ""}
              onChange={(e) => handleChange("roadAddress", e.currentTarget.value)}
              styles={inputStyles}
            />
          </SimpleGrid>
          <TextInput
            label="지번 주소"
            value={formData.address || ""}
            onChange={(e) => handleChange("address", e.currentTarget.value)}
            styles={inputStyles}
          />
          <SimpleGrid cols={isMobile ? 1 : 2}>
            <TextInput
              label="위도"
              value={
                typeof formData.lat === "number" ? formData.lat.toFixed(6) : ""
              }
              onChange={(e) =>
                handleChange(
                  "lat",
                  e.currentTarget.value ? Number(e.currentTarget.value) : null
                )
              }
              styles={inputStyles}
            />
            <TextInput
              label="경도"
              value={
                typeof formData.lng === "number" ? formData.lng.toFixed(6) : ""
              }
              onChange={(e) =>
                handleChange(
                  "lng",
                  e.currentTarget.value ? Number(e.currentTarget.value) : null
                )
              }
              styles={inputStyles}
            />
          </SimpleGrid>
        </Stack>

        <Stack gap="md">
          <Divider
            label={
              <Text size="xs" fw={500} c="grape.3">
                추가 정보
              </Text>
            }
            labelPosition="left"
          />
          <Textarea
            label="설명"
            placeholder="활동과 관련된 메모를 입력하세요"
            value={formData.description || ""}
            onChange={(e) => handleChange("description", e.currentTarget.value)}
            autosize
            minRows={2}
            styles={inputStyles}
          />
          <NumberInput
            label="예상 비용 (원)"
            value={formData.cost_estimate || 0}
            onChange={(val) => handleChange("cost_estimate", Number(val) || 0)}
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
