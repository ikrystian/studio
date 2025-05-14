import * as React from "react";

export interface ProgressionSettings {
  enableProgression: boolean;
  selectedModel:
    | "linear_weight"
    | "linear_reps"
    | "double_progression"
    | "none";
  linearWeightIncrement?: number;
  linearWeightCondition?: string; // Optional condition description
  linearRepsIncrement?: number;
  linearRepsCondition?: string; // Optional condition description
  doubleProgressionRepRange?: string; // e.g., "8-12"
  doubleProgressionWeightIncrement?: number;
  doubleProgressionCondition?: string; // Optional condition description
}

const DEFAULT_PROGRESSION_SETTINGS: ProgressionSettings = {
  enableProgression: true,
  selectedModel: "linear_weight",
  linearWeightIncrement: 2.5,
  linearWeightCondition: "Jeśli osiągnięto górny zakres powtórzeń",
  linearRepsIncrement: 1,
  linearRepsCondition: "Jeśli osiągnięto dolny zakres powtórzeń",
  doubleProgressionRepRange: "8-12",
  doubleProgressionWeightIncrement: 2.5,
  doubleProgressionCondition:
    "Jeśli osiągnięto górny zakres powtórzeń w ostatniej serii",
};

interface ProgressionSettingsContextType {
  settings: ProgressionSettings;
  // In a real app, you would add functions here to update settings
  // For now, we'll use a mock provider
}

const ProgressionSettingsContext = React.createContext<
  ProgressionSettingsContextType | undefined
>(undefined);

export const ProgressionSettingsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // In a real app, settings would be loaded from storage or API and managed with useState
  const [settings, setSettings] = React.useState<ProgressionSettings>(
    DEFAULT_PROGRESSION_SETTINGS
  );

  // Mock effect to simulate loading settings (optional)
  // React.useEffect(() => {
  //   // Simulate loading from localStorage
  //   const savedSettings = localStorage.getItem('workoutWiseProgressionSettings');
  //   if (savedSettings) {
  //     try {
  //       setSettings(JSON.parse(savedSettings));
  //     } catch (e) {
  //       console.error("Failed to parse progression settings from localStorage", e);
  //     }
  //   }
  // }, []);

  const contextValue = React.useMemo(() => ({ settings }), [settings]);

  return (
    <ProgressionSettingsContext.Provider value={contextValue}>
      {children}
    </ProgressionSettingsContext.Provider>
  );
};

export const useProgressionSettings = () => {
  const context = React.useContext(ProgressionSettingsContext);
  if (context === undefined) {
    throw new Error(
      "useProgressionSettings must be used within a ProgressionSettingsProvider"
    );
  }
  return context;
};
