import { useCallback } from "react";
import { useProfileStore } from "../stores/profileStore";
import { profileService } from "../services/profileService";

/**
 * useProfile — profile CRUD operations hook.
 */
export function useProfile() {
  const store = useProfileStore();

  const createProfile = useCallback(async (data) => {
    const { data: profile } = await profileService.create(data);
    store.setProfile(profile);
    return profile;
  }, [store]);

  const loadProfile = useCallback(async (id) => {
    const { data: profile } = await profileService.get(id);
    store.setProfile(profile);
    return profile;
  }, [store]);

  const updateProfile = useCallback(async (id, updates) => {
    const { data: profile } = await profileService.update(id, updates);
    store.setProfile(profile);
    return profile;
  }, [store]);

  return {
    ...store,
    createProfile,
    loadProfile,
    updateProfile,
  };
}
