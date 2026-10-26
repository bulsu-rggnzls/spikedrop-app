using System;
using System.Diagnostics;
using System.Globalization;
using System.Runtime.InteropServices;

namespace SpikeDropAudio {
    [ComImport]
    [Guid("BCDE0395-E52F-467C-8E3D-C4579291692E")]
    internal class MMDeviceEnumeratorComObject { }

    internal enum EDataFlow { eRender, eCapture, eAll }
    internal enum ERole { eConsole, eMultimedia, eCommunications }

    [Guid("A95664D2-9614-4F35-A746-DE8DB63617E6"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    internal interface IMMDeviceEnumerator {
        int NotImpl1();
        [PreserveSig]
        int GetDefaultAudioEndpoint(EDataFlow dataFlow, ERole role, out IMMDevice ppDevice);
    }

    [Guid("D666063F-1587-4E43-81F1-B948E807363F"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    internal interface IMMDevice {
        [PreserveSig]
        int Activate(ref Guid iid, int dwClsCtx, IntPtr pActivationParams, [MarshalAs(UnmanagedType.IUnknown)] out object ppInterface);
    }

    [Guid("77AA99A0-1BD6-484F-8BC7-2C654C9A9B6F"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    internal interface IAudioSessionManager2 {
        int NotImpl1();
        int NotImpl2();
        [PreserveSig]
        int GetSessionEnumerator(out IAudioSessionEnumerator SessionEnum);
        [PreserveSig]
        int RegisterSessionNotification(IntPtr SessionNotification);
        [PreserveSig]
        int UnregisterSessionNotification(IntPtr SessionNotification);
        [PreserveSig]
        int RegisterDuckNotification(string sessionID, IntPtr duckNotification);
        [PreserveSig]
        int UnregisterDuckNotification(IntPtr duckNotification);
    }

    [Guid("E2F5BB11-0570-40CA-ACDD-3AA01277DEE8"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    internal interface IAudioSessionEnumerator {
        [PreserveSig]
        int GetCount(out int SessionCount);
        [PreserveSig]
        int GetSession(int SessionIndex, out IAudioSessionControl Session);
    }

    [Guid("F4B1A599-7266-4319-A8CA-E70ACB11E8CD"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    internal interface IAudioSessionControl {
        int NotImpl1();
        int NotImpl2();
        int NotImpl3();
        int NotImpl4();
        int NotImpl5();
        int NotImpl6();
        int NotImpl7();
        int NotImpl8();
    }

    [Guid("BFB7FF88-7239-4FC9-8FA2-07C950BE9C6D"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    internal interface IAudioSessionControl2 : IAudioSessionControl {
        [PreserveSig] int NotImpl9();
        [PreserveSig] int NotImpl10();
        [PreserveSig] int NotImpl11();
        [PreserveSig] int NotImpl12();
        [PreserveSig] int NotImpl13();
        [PreserveSig] int NotImpl14();
        [PreserveSig] int NotImpl15();
        [PreserveSig] int NotImpl16();
        [PreserveSig] int GetSessionIdentifier([MarshalAs(UnmanagedType.LPWStr)] out string pRetVal);
        [PreserveSig] int GetSessionInstanceIdentifier([MarshalAs(UnmanagedType.LPWStr)] out string pRetVal);
        [PreserveSig] int GetProcessId(out int pRetVal);
        [PreserveSig] int IsSystemSoundsSession();
        [PreserveSig] int SetDuckingPreference(bool optOut);
    }

    [Guid("87CE5498-68D6-44E5-9215-6DA47EF883D8"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    internal interface ISimpleAudioVolume {
        [PreserveSig]
        int SetMasterVolume(float fLevel, ref Guid EventContext);
        [PreserveSig]
        int GetMasterVolume(out float pfLevel);
        [PreserveSig]
        int SetMute(bool bMute, ref Guid EventContext);
        [PreserveSig]
        int GetMute(out bool pbMute);
    }

    public class Program {
        [DllImport("user32.dll")]
        public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);

        const byte VK_MEDIA_NEXT_TRACK = 0xB0;
        const byte VK_MEDIA_PREV_TRACK = 0xB1;
        const byte VK_MEDIA_STOP = 0xB2;
        const byte VK_MEDIA_PLAY_PAUSE = 0xB3;
        const uint KEYEVENTF_KEYUP = 0x0002;

        public static int Main(string[] args) {
            try {
                string command = args.Length > 0 ? args[0].ToLowerInvariant() : "list";

                // Fast media key command: audioController.exe media <play|pause|stop|next|prev>
                if (command == "media") {
                    string action = args.Length > 1 ? args[1].ToLowerInvariant() : "play";
                    if (action == "stop") {
                        keybd_event(VK_MEDIA_STOP, 0, 0, UIntPtr.Zero);
                        keybd_event(VK_MEDIA_STOP, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
                    } else if (action == "next") {
                        keybd_event(VK_MEDIA_NEXT_TRACK, 0, 0, UIntPtr.Zero);
                        keybd_event(VK_MEDIA_NEXT_TRACK, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
                    } else if (action == "prev") {
                        keybd_event(VK_MEDIA_PREV_TRACK, 0, 0, UIntPtr.Zero);
                        keybd_event(VK_MEDIA_PREV_TRACK, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
                    } else {
                        // play / pause / toggle
                        keybd_event(VK_MEDIA_PLAY_PAUSE, 0, 0, UIntPtr.Zero);
                        keybd_event(VK_MEDIA_PLAY_PAUSE, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
                    }
                    Console.WriteLine("OK");
                    return 0;
                }

                var enumerator = (IMMDeviceEnumerator)(new MMDeviceEnumeratorComObject());
                IMMDevice dev = null;
                enumerator.GetDefaultAudioEndpoint(EDataFlow.eRender, ERole.eMultimedia, out dev);
                if (dev == null) {
                    Console.Error.WriteLine("ERROR: No default audio endpoint.");
                    return 2;
                }

                Guid IID_IAudioSessionManager2 = typeof(IAudioSessionManager2).GUID;
                object obj = null;
                dev.Activate(ref IID_IAudioSessionManager2, 0, IntPtr.Zero, out obj);
                var mgr = (IAudioSessionManager2)obj;
                IAudioSessionEnumerator sessionEnum = null;
                mgr.GetSessionEnumerator(out sessionEnum);
                int count = 0;
                sessionEnum.GetCount(out count);

                if (command == "list") {
                    for (int i = 0; i < count; i++) {
                        IAudioSessionControl ctl = null;
                        sessionEnum.GetSession(i, out ctl);
                        var ctl2 = ctl as IAudioSessionControl2;
                        if (ctl2 != null) {
                            int pid = 0;
                            ctl2.GetProcessId(out pid);
                            string pName = "";
                            if (pid > 0) {
                                try {
                                    pName = Process.GetProcessById(pid).ProcessName;
                                } catch { }
                            }
                            var vol = ctl as ISimpleAudioVolume;
                            float level = 0f;
                            bool isMuted = false;
                            if (vol != null) {
                                vol.GetMasterVolume(out level);
                                vol.GetMute(out isMuted);
                            }
                            Console.WriteLine(string.Format(CultureInfo.InvariantCulture, "{0}|{1}|{2:0.00}|{3}", pid, pName, level, isMuted));
                        }
                    }
                    return 0;
                }

                if (args.Length < 2) {
                    Console.Error.WriteLine("ERROR: Process name required.");
                    return 1;
                }

                string targetProcess = args[1].ToLowerInvariant();
                if (targetProcess.EndsWith(".exe")) {
                    targetProcess = targetProcess.Substring(0, targetProcess.Length - 4);
                }

                bool found = false;
                Guid emptyGuid = Guid.Empty;

                for (int i = 0; i < count; i++) {
                    IAudioSessionControl ctl = null;
                    sessionEnum.GetSession(i, out ctl);
                    var ctl2 = ctl as IAudioSessionControl2;
                    if (ctl2 != null) {
                        int pid = 0;
                        ctl2.GetProcessId(out pid);
                        if (pid <= 0) continue;

                        string pName = "";
                        try {
                            pName = Process.GetProcessById(pid).ProcessName.ToLowerInvariant();
                        } catch {
                            continue;
                        }

                        if (pName == targetProcess || pName.Contains(targetProcess)) {
                            found = true;
                            var vol = ctl as ISimpleAudioVolume;
                            if (vol == null) continue;

                            if (command == "get") {
                                float level = 0f;
                                vol.GetMasterVolume(out level);
                                Console.WriteLine(level.ToString(CultureInfo.InvariantCulture));
                                return 0;
                            } else if (command == "set" && args.Length >= 3) {
                                float targetVol = float.Parse(args[2], CultureInfo.InvariantCulture);
                                if (targetVol < 0.0f) targetVol = 0.0f;
                                if (targetVol > 1.0f) targetVol = 1.0f;
                                vol.SetMasterVolume(targetVol, ref emptyGuid);
                                Console.WriteLine("OK");
                            } else if (command == "mute" && args.Length >= 3) {
                                bool mute = bool.Parse(args[2]);
                                vol.SetMute(mute, ref emptyGuid);
                                Console.WriteLine("OK");
                            }
                        }
                    }
                }

                if (!found) {
                    Console.Error.WriteLine("PROCESS_NOT_FOUND");
                    return 3;
                }

                return 0;
            } catch (Exception ex) {
                Console.Error.WriteLine("EXCEPTION: " + ex.Message);
                return 99;
            }
        }
    }
}
