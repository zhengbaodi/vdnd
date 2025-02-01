const { ref } = Vue;
const {
  useNativeDnd,
  useMouseDnd,
  useTouchDnd,
  NativeDndPlugin,
  MouseDndPlugin,
  TouchDndPlugin,
} = Vdnd2;
const presets = {
  native: {
    useDnd: useNativeDnd,
    plugin: NativeDndPlugin,
  },
  mouse: {
    useDnd: useMouseDnd,
    plugin: MouseDndPlugin,
  },
  touch: {
    useDnd: useTouchDnd,
    plugin: TouchDndPlugin,
  },
};

class CallbackController {
  enabled = true;
  constructor(callback) {
    this.callback = (...args) => {
      if (this.enabled) {
        callback(...args);
      }
    };
  }
  enable() {
    this.enabled = true;
  }
  disable() {
    this.enabled = false;
  }
}

function loadEnv(type) {
  const native = type === 'native';
  const { useDnd, plugin } = presets[type];
  Vue.use(plugin);

  const app = new Vue({
    el: '#app',
    setup() {
      const dnd = useDnd({
        strict: true,
      });
      console.log(dnd);

      const onDragHandlerCtrl = new CallbackController((a, b) =>
        console.log(a, b)
      );
      const onDragOverHandlerCtrl = new CallbackController((a, b) =>
        console.log(a, b)
      );

      dnd.on('drag', (e) => onDragHandlerCtrl.callback('drag', e));

      dnd.on('drag:start', (e) => {
        console.log('drag:start', e);
        const t = setTimeout(
          () => {
            clearTimeout(t);
            onDragHandlerCtrl.disable();
          },
          native ? 16 : 50
        );
      });

      dnd.on('drag:prevent', (e) => {
        console.log('drag:prevent', e);
      });

      dnd.on('drag:enter', (e) => {
        console.log('drag:enter', e);
        const t = setTimeout(
          () => {
            clearTimeout(t);
            onDragOverHandlerCtrl.disable();
          },
          native ? 16 : 50
        );
      });

      dnd.on('drag:over', (e) =>
        onDragOverHandlerCtrl.callback('drag:over', e)
      );

      dnd.on('drag:leave', (e) => {
        console.log('drag:leave', e);
        onDragOverHandlerCtrl.enable();
      });

      dnd.on('drop', (e) => {
        console.log('drop', e);
      });

      dnd.on('drag:end', (e) => {
        console.log('drag:end', e);
        onDragHandlerCtrl.enable();
        onDragOverHandlerCtrl.enable();
      });

      const left = ref([1, 2, 3]);
      return {
        dnd,
        left,
      };
    },
  });
  app.$mount();
}
