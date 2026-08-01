import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getMyProfile from "./tools/get-my-profile";
import listEvacuationLists from "./tools/list-evacuation-lists";
import listEvacuationEntries from "./tools/list-evacuation-entries";
import addEvacuationEntry from "./tools/add-evacuation-entry";
import searchHospitals from "./tools/search-hospitals";
import listMarketplaceListings from "./tools/list-marketplace-listings";
import listAnnouncements from "./tools/list-announcements";

// OAuth issuer must be the direct Supabase host; VITE_SUPABASE_PROJECT_ID is
// inlined at build time and survives publish, unlike SUPABASE_URL.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "shiftflow-mcp",
  title: "ShiftFlow Nurse",
  version: "0.1.0",
  instructions:
    "Tools for ShiftFlow Nurse, an Algerian hospital workforce app. Read the signed-in user's profile and roles, browse and update their evacuation rosters, search the Algerian hospital directory, read hospital announcements, and browse marketplace listings. All access runs as the authenticated user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    getMyProfile,
    listEvacuationLists,
    listEvacuationEntries,
    addEvacuationEntry,
    searchHospitals,
    listMarketplaceListings,
    listAnnouncements,
  ],
});
