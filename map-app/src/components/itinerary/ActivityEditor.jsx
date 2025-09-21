import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
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
import { Save, Clock, DollarSign, Info } from "lucide-react";
import PlaceSearchInput from "../directions/PlaceSearchInput";
import { NeonButton, GradientText } from "components/ui/NeonTheme";

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
    setFormData((prev) => ({ ...prev, [key]: value }));
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

  const neonInputStyles = useMemo(
    () => ({
      label: {
        color: "#d1d5db",
        marginBottom: "4px",
        fontSize: "var(--mantine-font-size-sm)",
      },
      input: {
        backgroundColor: "rgba(10, 5, 20, 0.7)",
        borderColor: "rgba(168, 85, 247, 0.3)",
        color: "#f9fafb",
        transition: "border-color 200ms ease, box-shadow 200ms ease",
        "&:focus": {
          borderColor: "rgba(236, 72, 153, 0.8)",
          boxShadow: "0 0 8px rgba(236, 72, 153, 0.5)",
        },
      },
      icon: { color: "#9ca3af" },
    }),
    []
  );

  if (!activity) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<GradientText size="xl">활동 편집</GradientText>}
      size="xl"
      radius="md"
      fullScreen={isMobile}
      centered={!isMobile}
      overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
      styles={{
        content: {
          backgroundColor: "rgba(10, 5, 20, 0.8)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(168, 85, 247, 0.3)",
        },
        header: {
          backgroundColor: "transparent",
          borderBottom: "1px solid rgba(168, 85, 247, 0.2)",
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
            styles={{ label: { color: "#d8b4fe" } }}
          />
          <SimpleGrid cols={isMobile ? 1 : 2}>
            <TextInput
              label="시간"
              type="time"
              value={formData.time || ""}
              onChange={(e) => handleChange("time", e.currentTarget.value)}
              leftSection={<Clock size={16} />}
              styles={neonInputStyles}
            />
            <NumberInput
              label="체류 시간 (분)"
              value={formData.duration ?? 60}
              onChange={(val) => handleChange("duration", Number(val) || 0)}
              min={0}
              step={15}
              styles={neonInputStyles}
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
            styles={{ label: { color: "#d8b4fe" } }}
          />
          <Input.Wrapper label="장소명" styles={neonInputStyles}>
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
              onChange={(e) =>
                handleChange("place_type", e.currentTarget.value)
              }
              leftSection={<Info size={16} />}
              styles={neonInputStyles}
            />
            <TextInput
              label="도로명 주소"
              value={formData.roadAddress || ""}
              onChange={(e) =>
                handleChange("roadAddress", e.currentTarget.value)
              }
              styles={neonInputStyles}
            />
          </SimpleGrid>
          <TextInput
            label="지번 주소"
            value={formData.address || ""}
            onChange={(e) => handleChange("address", e.currentTarget.value)}
            styles={neonInputStyles}
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
              styles={neonInputStyles}
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
              styles={neonInputStyles}
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
            styles={{ label: { color: "#d8b4fe" } }}
          />
          <Textarea
            label="설명"
            placeholder="활동과 관련된 메모를 입력하세요"
            value={formData.description || ""}
            onChange={(e) => handleChange("description", e.currentTarget.value)}
            autosize
            minRows={2}
            styles={neonInputStyles}
          />
          <NumberInput
            label="예상 비용 (원)"
            value={formData.cost_estimate || 0}
            onChange={(val) => handleChange("cost_estimate", Number(val) || 0)}
            min={0}
            step={1000}
            leftSection={<DollarSign size={16} />}
            styles={neonInputStyles}
          />
        </Stack>
        <Group justify="flex-end" mt="xl">
          <NeonButton variant="secondary" onClick={onClose}>
            취소
          </NeonButton>
          <NeonButton onClick={handleSave} leftSection={<Save size={16} />}>
            저장
          </NeonButton>
        </Group>
      </Stack>
    </Modal>
  );
}
