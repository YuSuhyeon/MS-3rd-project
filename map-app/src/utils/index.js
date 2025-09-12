export function createPageUrl(name) {
  switch (name) {
    case "Home":
      return "/persona";
    case "ResultDashboard":
      return "/result";
    case "DirectionsMantine":
      return "/directions";
    case "DocentMantine":
      return "/docent";
    case "DocentVision":
      return "/vision";
    case "VisionOCR":
      return "/visionocr";
    case "ItineraryPlanner":
      return "/itinerary";
    case "ItineraryView":
      return "/itinerary";
    case "CommunityMain":
      return "/community";
    case "VisionOCR":
      return "/visionocr";
    case "Tour":
      return "/tour";
    case "TourDetail":
      return "/tour/:id";
    default:
      return "/";
  }
}
