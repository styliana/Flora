package com.flo.periodtracker;

import android.os.Bundle;
import android.view.View;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Dynamically adapt padding so webview never overlaps selfie camera or navigation bar
        View contentView = findViewById(android.R.id.content);
        if (contentView != null) {
            ViewCompat.setOnApplyWindowInsetsListener(contentView, (v, insets) -> {
                int top = insets.getInsets(WindowInsetsCompat.Type.systemBars()).top;
                int bottom = insets.getInsets(WindowInsetsCompat.Type.systemBars()).bottom;
                int left = insets.getInsets(WindowInsetsCompat.Type.systemBars()).left;
                int right = insets.getInsets(WindowInsetsCompat.Type.systemBars()).right;
                v.setPadding(left, top, right, bottom);
                return insets;
            });
        }
    }
}
