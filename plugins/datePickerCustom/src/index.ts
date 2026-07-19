console.log("[CustomDatePickerPlugin] loaded");

export class CustomDatePickerPlugin {
  configure(config: Record<string, any>) {
    console.log("[CustomDatePickerPlugin] configure", config);
    return this;
  }

  register() {
    console.log("[CustomDatePickerPlugin] register");
    return this;
  }
}

export default CustomDatePickerPlugin;
