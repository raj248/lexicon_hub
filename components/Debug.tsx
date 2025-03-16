import { StyleSheet, View } from 'react-native';
import { Text } from './nativewindui/Text';
import { Button } from './nativewindui/Button';

import { EPUBHandler } from "epub-core"
import { ScanFiles } from '~/modules/FileUtil';
import { useEffect } from 'react';

const className_button = 'm-4 p-4'
export default function Debug() {
  const epub = new EPUBHandler()
  useEffect(() => {
    const startAsync = async () => {
      await epub.loadFile("/storage/emulated/0/Books/The Ideal Sponger Life Vol 13.epub")
    }
    startAsync();
  }, [])

  const onPressDebug = async () => {
    const res = await epub.parseEPUB();
    console.log(res.spine);
  }

  function OnPressScan() {
    (async () => {
      ScanFiles()
        .then((res) => { console.log(res) });
    })()
  }

  return (
    <View className='flex-1 justify-center items-center'>
      <Button variant='secondary' className={className_button} onPress={() => {
        console.log("Debug OnPress");
        onPressDebug();
      }}>
        <Text>Debug</Text>
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
