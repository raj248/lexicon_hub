import { usePreferencesStore } from "~/stores/preferenceStore";
import { useColorScheme } from "~/lib/useColorScheme";
import {COLORS} from "~/theme/colors"
export function injectStyles(htmlContent: string): string {
  const preferences = usePreferencesStore.getState().preferences
  const colors = preferences.readingMode=="dark"? COLORS.dark:COLORS.light;
  console.log(preferences.readingMode)
  return htmlContent.replace(
    "</head>",
    `<style>
      body {
        font-family: 'Arial', sans-serif;
        line-height: ${1.8};
        color: ${colors.foreground};
        background-color: ${colors.background};
        margin: 20px;
        padding: 20px;
        font-size: ${preferences.fontSize}px;
      }
      h1 {
        color: ${colors.foreground};
        text-align: center;
        font-size: ${preferences.fontSize + 7}px;
      }
      p {
        margin: 12px 0;
      }
      .centerp {
        text-align: center;
        font-weight: bold;
      }
      img, audio, video {
        display: block;
        max-width: 100%;
        margin: 10px auto;
      }
    </style></head>`
  );
}