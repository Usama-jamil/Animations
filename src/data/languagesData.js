import ENFlag from '../../assets/icons/flags/en.svg';
import DEFlag from '../../assets/icons/flags/de.svg';
import FRFlag from '../../assets/icons/flags/fr.svg';
import {Image} from 'react-native';

export const languagesData = [
  {
    _id: 1,
    flag: <ENFlag width={24} height={24} />,
    langName: 'English',
    transalation: '(English)',
    code: 'en',
  },

  {
    _id: 2,
    flag: (
      <Image
        source={require('../../assets/icons/flags/ar.png')}
        style={{width: 24, height: 24, resizeMode: 'contain'}}
      />
    ),
    langName: 'Arabic',
    transalation: '(Arabic)',
    code: 'ar',
  },
  // {
  //   _id: 3,
  //   flag: <DEFlag width={24} height={24} />,
  //   langName: 'German',
  //   transalation: '(Deutsch)',
  //   code: 'ge',
  // },
  // {
  //   _id: 4,
  //   flag: <FRFlag width={24} height={24} />,
  //   langName: 'French',
  //   transalation: '(Français)',
  //   code: 'fr',
  // },
];
