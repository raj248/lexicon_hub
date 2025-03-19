import { InteractionManager, StyleSheet, View } from 'react-native';
import { Text } from './nativewindui/Text';
import { Button } from './nativewindui/Button';
// import { Button } from '~/components/Button';

import { EPUBHandler } from "epub-core"
import { ScanFiles, readFileFromZip } from '~/modules/FileUtil';
import { useEffect } from 'react';
import { useBookStore } from '~/stores/bookStore';

const className_button = 'm-4 p-4'
const epubPath = "/storage/emulated/0/Books/The Ideal Sponger Life Vol 13.epub"
const opfPath = "OEBPS/content.opf"
const coverImage = "OEBPS/Images/Cover.jpg"

export function DebugContent() {
  const epub = new EPUBHandler()
  const { debugClear } = useBookStore.getState()
  useEffect(() => {
    // console.log(useBookStore.getState().books)
    const startAsync = async () => {
      // await epub.loadFile("file://storage/emulated/0/Books/The Ideal Sponger Life Vol 13.epub")
    }
    startAsync();
  }, [])

  function onPressDebug() {
    (async () => {
      console.log("Start reading file...");

      const startTime = performance.now(); // Start timer

      const content = await readFileFromZip(epubPath, coverImage, "base64").catch(err => {
        console.log("Error:", err);
        return null;
      });

      const endTime = performance.now(); // End timer
      console.log("Finished reading file.");

      if (content) {
        console.log("Content Length:", content.length);
      }

      console.log(`Execution Time: ${(endTime - startTime).toFixed(2)}ms`);

      const runs = 1;
      let totalTime = 0;
      for (let i = 0; i < runs; i++) {
        const start = performance.now();
        await readFileFromZip(epubPath, coverImage, "base64");
        const end = performance.now();
        totalTime += end - start;
      }
      console.log(`Average Time: ${totalTime / runs}ms`);
    })();
  }

  function onPressEpubCore() {
    (async () => {
      console.log("Starting EPUB Load & Extract Test...");
      const startLoad = performance.now();
      await epub.loadFile("file://storage/emulated/0/Books/The Ideal Sponger Life Vol 13.epub", true);
      const endLoad = performance.now();
      console.log(`📖 EPUB Load Time: ${(endLoad - startLoad).toFixed(2)}ms`);

      const startExtract = performance.now();
      const content = await epub.extractChapter("Text/prologue.xhtml");
      const endExtract = performance.now();
      console.log(`📄 Chapter Extract Time: ${(endExtract - startExtract).toFixed(2)}ms`);

      console.log(`✅ Total Execution Time: ${(endExtract - startLoad).toFixed(2)}ms`);
      console.log("Extracted Content Length:", content?.length || 0);
    })()
  }


  function OnPressScan() {
    (async () => {
      ScanFiles()
        .then((res) => { console.log(res) });
    })()
  }
  function clear() {
    console.log("clearing")
    InteractionManager.runAfterInteractions(() => {
      // Object.keys(books).map((id) => useBookStore.getState().removeBook(id))
      // Object.keys(watchers).map((id) => useWatcherStore.getState().removeWatcher(id))
      debugClear();
      console.log("cleared")
    });
  }
  return (
    <View className='flex-1 justify-center items-center'>
      <Button onPress={clear} >
        <Text>
          Clear Debug
        </Text>
      </Button>
      <Button variant='secondary' className={className_button} onPress={onPressDebug}>
        <Text>Debug Images</Text>
      </Button>
      <Button variant='primary' className={className_button} onPress={onPressEpubCore}>
        <Text>Epub Core</Text>
      </Button>
      <Button variant='tonal' onPress={OnPressScan}>
        <Text>Scan Files</Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  codeHighlightContainer: {
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  getStartedText: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
  helpContainer: {
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 15,
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    textAlign: 'center',
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
});
