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
import {useTranslation} from "react-i18next";

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
  const { t } = useTranslation("planner");
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
      title={<GradientText size="xl">{t("activity_editor")}</GradientText>}
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
                {t("time_info")}
              </Text>
            }
            labelPosition="left"
            styles={{ label: { color: "#d8b4fe" } }}
          />
          <SimpleGrid cols={isMobile ? 1 : 2}>
            <TextInput
              label={t("time")}
              type="time"
              value={formData.time || ""}
              onChange={(e) => handleChange("time", e.currentTarget.value)}
              leftSection={<Clock size={16} />}
              styles={neonInputStyles}
            />
            <NumberInput
              label={t("stay_time")}
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
                {t("place_info")}
              </Text>
            }
            labelPosition="left"
            styles={{ label: { color: "#d8b4fe" } }}
          />
          <Input.Wrapper label={t("place_name")} styles={neonInputStyles}>
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
              placeholder={t("search_place_placeholder")}
              className="itinerary-place-input"
              appearance="dark"
              inputClassName="border-[rgba(168,85,247,0.35)] focus:border-[rgba(236,72,153,0.8)] focus:ring-[rgba(236,72,153,0.45)]"
              dropdownClassName="border-[rgba(168,85,247,0.35)]"
            />
          </Input.Wrapper>
          <SimpleGrid cols={isMobile ? 1 : 2}>
            <TextInput
              label={t("place_type")}
              placeholder="attraction / restaurant ..."
              value={formData.place_type || ""}
              onChange={(e) =>
                handleChange("place_type", e.currentTarget.value)
              }
              leftSection={<Info size={16} />}
              styles={neonInputStyles}
            />
            <TextInput
              label={t("road_address")}
              value={formData.roadAddress || ""}
              onChange={(e) =>
                handleChange("roadAddress", e.currentTarget.value)
              }
              styles={neonInputStyles}
            />
          </SimpleGrid>
          <TextInput
            label={t("address")}
            value={formData.address || ""}
            onChange={(e) => handleChange("address", e.currentTarget.value)}
            styles={neonInputStyles}
          />
          <SimpleGrid cols={isMobile ? 1 : 2}>
            <TextInput
              label={t("latitude")}
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
              label={t("longitude")}
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
                {t("additional_info")}
              </Text>
            }
            labelPosition="left"
            styles={{ label: { color: "#d8b4fe" } }}
          />
          <Textarea
            label={t("description")}
            placeholder={t("description_placeholder")}
            value={formData.description || ""}
            onChange={(e) => handleChange("description", e.currentTarget.value)}
            autosize
            minRows={2}
            styles={neonInputStyles}
          />
          <NumberInput
            label={t("cost_estimate")}
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
            {t("cancel")}
          </NeonButton>
          <NeonButton onClick={handleSave} leftSection={<Save size={16} />}>
            {t("save")}
          </NeonButton>
        </Group>
      </Stack>
    </Modal>
  );
}
