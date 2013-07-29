package com.catalog;

import android.os.Bundle;

import org.apache.cordova.*;

import java.io.*;

public class MainActivity extends DroidGap {

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		
		try {
			String pName = this.getClass().getPackage().getName();
			String dest = "/data/data/" + pName + "/databases/";
			copy("category.db", dest);
			 
			for (int i = 1; i < 13; i++) {
				copy(String.format("product.%d.db", i), dest);
			}
		}
		
		catch (IOException ex) {
			ex.printStackTrace();
		}
		
		super.loadUrl("file:///android_asset/www/index.html");
	}
	
	private void copy(String file, String folder) throws IOException {
		File CheckDirectory;
		CheckDirectory = new File(folder);
		
		if (!CheckDirectory.exists()) {
			CheckDirectory.mkdir();
		}
		  
		InputStream in = getApplicationContext().getAssets().open("data/" + file);
		OutputStream out = new FileOutputStream(folder + file);
		  
		// Transfer bytes from in to out
		byte[] buf = new byte[1024];
		int len; while ((len = in.read(buf)) > 0) out.write(buf, 0, len);
		in.close(); out.close();
	}
}
