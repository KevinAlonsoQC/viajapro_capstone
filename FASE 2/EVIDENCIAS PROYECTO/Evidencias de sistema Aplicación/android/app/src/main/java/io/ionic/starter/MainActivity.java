package io.ionic.starter;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle; // Asegúrate de que esta línea esté presente
import com.capacitorjs.plugins.device.DevicePlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        registerPlugin(DevicePlugin.class);
    }
}
