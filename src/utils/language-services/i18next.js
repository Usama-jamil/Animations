import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import de from '../locales/de.json';
import fr from '../locales/fr.json'
import ar from '../locales/ar.json'
import hy from '../locales/hy.json'
import bn from '../locales/bn.json'
import zh from '../locales/chines.json'
import da from '../locales/da.json'
import es from '../locales/es.json'
import fi from '../locales/fi.json'
import ur from '../locales/ur.json'
import hi from '../locales/hi.json'
import nl from '../locales/nl.json'
import zhch from '../locales/zh-CN.json'
import ms from '../locales/ms.json'
import ku from '../locales/ku.json'
import pl from '../locales/pl.json'
import pt from '../locales/pt.json'
import no from '../locales/no.json'
import th from '../locales/th.json'
import ga from '../locales/ga.json'
import pa from '../locales/pa.json'
import tr from '../locales/tr.json'
import ta from '../locales/ta.json'
import ru from '../locales/ru.json'
import sv from '../locales/sv.json'



export const languageResources = {
  en: { translation: en },
  de: { translation: de },
  fr: { translation: fr },
  ar: { translation: ar },
  hy: { translation: hy },
  bn: { translation: bn },
  zh: { translation: zh },
  da: { translation: da },
  es: { translation: es },
  fi: { translation: fi },
  ur: { translation: ur },
  hi: { translation: hi },
  nl: { translation: nl },
  zhch: { translation: zhch },
  ms: { translation: ms },
  ku: { translation: ku },
  pl: { translation: pl },
  pt: { translation: pt },
  no: { translation: no },
  th: { translation: th },
  ga: { translation: ga },
  pa: { translation: pa },
  tr: { translation: tr },
  ta: { translation: ta },
  ru: { translation: ru },
  sv: { translation: sv },


};
i18next.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'en',
  fallbackLng: 'en',
  resources: languageResources,
});

export default i18next;
