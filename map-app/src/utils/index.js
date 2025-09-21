export function createPageUrl(name) {
  switch (name) {
    case "Home":
      return "/persona";
    case "ResultDashboard":
      return "/result";
    case "DirectionsMantine":
    case "DirectionsMantineImproved":
      return "/directions";
    case "DocentMantine":
      return "/docent";
    case "DocentVision":
      return "/vision";
    case "VisionOCR":
      return "/visionocr";
    case "DocentVision":
      return "/vision";
    case "ItineraryPlanner":
      return "/itinerary";
    case "ItineraryView":
      return "/itinerary";
    case "CommunityMain":
      return "/community";
    case "Tour":
      return "/tour";
    case "TourDetail":
      return "/tour/:id";
    case "CommunitySocial":
      return "/social";
    default:
      return "/";
  }
}
