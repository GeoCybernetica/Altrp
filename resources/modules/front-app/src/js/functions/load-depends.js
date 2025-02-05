import WIDGETS_DEPENDS from "../constants/WIDGETS_DEPENDS";

window.libsLoaded = [];
window.LIBS = {
  'blueprint': () => {
    return import(/* webpackChunkName: 'Blueprint' */'../libs/blueprint').then(res => {
      window.libsLoaded.push('blueprint')
      console.log('LOAD Blueprint: ', performance.now());
      return Promise.resolve(res)
    });
  },
  'moment': () => {
    return import(/* webpackChunkName: 'moment' */'../libs/moment').then(res => {
      window.libsLoaded.push('moment')
      console.log('LOAD moment: ', performance.now());
      return Promise.resolve(res)
    });
  },
  'blueprint-select': () => {
    return import(/* webpackChunkName: 'blueprint-select' */'../libs/blueprint-select').then(res => {
      window.libsLoaded.push('blueprint-select')
      console.log('LOAD blueprint-select: ', performance.now());
      return Promise.resolve(res)
    });
  },
  'blueprint-datetime': () => {
    return import(/* webpackChunkName: 'blueprint-datetime' */'../libs/blueprint-datetime').then(res => {
      window.libsLoaded.push('blueprint-datetime')
      console.log('LOAD blueprint-datetime: ', performance.now());
      return Promise.resolve(res)
    });
  },
  'blueprint-popover': () => {
    return import(/* webpackChunkName: 'blueprint-popover' */'../libs/blueprint-popover').then(res => {
      window.libsLoaded.push('blueprint-popover')
      console.log('LOAD blueprint-popover: ', performance.now());
      return Promise.resolve(res)
    });
  },
  'ckeditor': () => {
    return import(/* webpackChunkName: 'ckeditor' */'../libs/ckeditor').then(res => {
      window.libsLoaded.push('ckeditor')
      console.log('LOAD ckeditor: ', performance.now());
      return Promise.resolve(res)
    });
  },
  'section-element-wrapper': () => {
    return import(/* webpackChunkName: 'section-element-wrapper' */'../libs/section-element-wrapper').then(res => {
      window.libsLoaded.push('section-element-wrapper')
      console.log('LOAD "section-element-wrapper": ', performance.now());
      return Promise.resolve(res)
    });
  },
  'template-loader': () => {
    return import(/* webpackChunkName: 'template-loader' */'../libs/template-loader').then(res => {
      window.libsLoaded.push('template-loader')
      console.log('LOAD "template-loader": ', performance.now());
      return Promise.resolve(res)
    });
  },
  'fullcalendar': () => {
    return import(/* webpackChunkName: 'fullcalendar' */'../libs/fullcalendar').then(res => {
      window.libsLoaded.push('fullcalendar')
      console.log('LOAD "fullcalendar": ', performance.now());
      return Promise.resolve(res)

    });
  },
  'image-crop': () => {
    return import(/* webpackChunkName: 'image-crop' */'../libs/image-crop').then(res => {
      window.libsLoaded.push('image-crop')
      console.log('LOAD "image-crop": ', performance.now());
      return Promise.resolve(res)
    });
  },
  'reacket': () => {
    return import(/* webpackChunkName: 'reacket' */'../libs/reacket').then(res => {
      window.libsLoaded.push('reacket')
      console.log('LOAD "reacket": ', performance.now());
      return Promise.resolve(res)
    });
  },
};

window.libsToLoad = window.libsToLoad || [];
__altrp_settings__.libsToLoad?.forEach(lib=>{
  libsToLoad.push(LIBS[lib]())
})
export default function loadDepends(){
  const _libsNames = [];
  if (window.altrpElementsLists) {
    window.altrpElementsLists.forEach(el => {
      if (WIDGETS_DEPENDS[el] && WIDGETS_DEPENDS[el].length) {
        WIDGETS_DEPENDS[el].forEach(lib => {
          if(_libsNames.indexOf(lib) !== -1){
            return
          }
          if (LIBS[lib]) {
            _libsNames.push(lib)
            libsToLoad.push(LIBS[lib]())
          }
        });
      }
    })
  } else {
    LIBS.forEach(lib => {
      libsToLoad.push(lib())
    })
  }
  Promise.all(window.libsToLoad).then(res => {
    import (/* webpackChunkName: 'FrontElementsManager' */'../classes/FrontElementsManager').then(module => {
      import (/* webpackChunkName: 'FrontElementsFabric' */'../classes/FrontElementsFabric').then(module => {
        console.log('LOAD FrontElementsFabric: ', performance.now());
        window.loadingCallback && window.loadingCallback();
      });
      return window.frontElementsManager.loadComponents();
    }).then(async components => {
      console.log('LOAD FrontElementsManager: ', performance.now());
      window.loadingCallback && window.loadingCallback();
    });
  });
}
