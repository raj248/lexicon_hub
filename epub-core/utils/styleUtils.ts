import { usePreferencesStore } from "~/stores/preferenceStore";

export function injectStyles(htmlContent: string): string {
    const preferences = usePreferencesStore.getState().preferences
  return htmlContent.replace(
    "</head>",
    `<style>
      body {
        font-family: 'Arial', sans-serif;
        line-height: ${1.8};
        color: #${333};
        margin: 20px;
        padding: 20px;
        font-size: ${preferences.fontSize}px;
      }
      h1 {
        color: #444;
        text-align: center;
        font-size: ${preferences.fontSize + 5}px;
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