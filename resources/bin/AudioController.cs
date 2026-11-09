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
        [PreserveSig] int EnumAudioEndpoints(EDataFlow dataFlow, int dwStateMask, out IMMDeviceCollection ppDevices);
        [PreserveSig] int GetDefaultAudioEndpoint(EDataFlow dataFlow, ERole role, out IMMDevice ppDevice);
    }

    [Guid("0BD7A1BE-7A1A-44DB-8397-CC5392387B5E"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    internal interface IMMDeviceCollection {
        [PreserveSig] int GetCount(out int pcDevices);
        [PreserveSig] int Item(int nDevice, out IMMDevice ppDevice);
    }

    [Guid("D666063F-1587-4E43-81F1-B948E807363F"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    internal interface IMMDevice {
        [PreserveSig] int Activate(ref Guid iid, int dwClsCtx, IntPtr pActivationParams, [MarshalAs(UnmanagedType.IUnknown)] out object ppInterface);
    }

    [Guid("77AA99A0-1BD6-484F-8BC7-2C654C9A9B6F"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    internal interface IAudioSessionManager2 {
        int NotImpl1();
        int NotImpl2();
        [PreserveSig] int GetSessionEnumerator(out IAudioSessionEnumerator SessionEnum);
    }

    [Guid("E2F5BB11-0570-40CA-ACDD-3AA01277DEE8"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    internal interface IAudioSessionEnumerator {
        [PreserveSig] int GetCount(out int SessionCount);
        [PreserveSig] int GetSession(int SessionIndex, out IAudioSessionControl Session);
    }

    [Guid("F4B1A599-7266-4319-A8CA-E70ACB11E8CD"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    internal interface IAudioSessionControl {
        int GetState(out int pRetVal);
        int GetDisplayName([MarshalAs(UnmanagedType.LPWStr)] out string pRetVal);
        int SetDisplayName([MarshalAs(UnmanagedType.LPWStr)] string Value, [MarshalAs(UnmanagedType.LPStruct)] Guid EventContext);
        int GetIconPath([MarshalAs(UnmanagedType.LPWStr)] out string pRetVal);
        int SetIconPath([MarshalAs(UnmanagedType.LPWStr)] string Value, [MarshalAs(UnmanagedType.LPStruct)] Guid EventContext);
        int GetGroupingParam(out Guid pRetVal);
        int SetGroupingParam([MarshalAs(UnmanagedType.LPStruct)] Guid Override, [MarshalAs(UnmanagedType.LPStruct)] Guid EventContext);
        int RegisterAudioSessionNotification(IntPtr pClient);
        int UnregisterAudioSessionNotification(IntPtr pClient);
    }

    [Guid("BFB7FF88-7239-4FC9-8FA2-07C950BE9C6D"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    internal interface IAudioSessionControl2 {
        int GetState(out int pRetVal);
        int GetDisplayName([MarshalAs(UnmanagedType.LPWStr)] out string pRetVal);
        int SetDisplayName([MarshalAs(UnmanagedType.LPWStr)] string Value, [MarshalAs(UnmanagedType.LPStruct)] Guid EventContext);
        int GetIconPath([MarshalAs(UnmanagedType.LPWStr)] out string pRetVal);
        int SetIconPath([MarshalAs(UnmanagedType.LPWStr)] string Value, [MarshalAs(UnmanagedType.LPStruct)] Guid EventContext);
        int GetGroupingParam(out Guid pRetVal);
        int SetGroupingParam([MarshalAs(UnmanagedType.LPStruct)] Guid Override, [MarshalAs(UnmanagedType.LPStruct)] Guid EventContext);
        int RegisterAudioSessionNotification(IntPtr pClient);
        int UnregisterAudioSessionNotification(IntPtr pClient);

        [PreserveSig] int GetSessionIdentifier([MarshalAs(UnmanagedType.LPWStr)] out string pRetVal);
        [PreserveSig] int GetSessionInstanceIdentifier([MarshalAs(UnmanagedType.LPWStr)] out string pRetVal);
        [PreserveSig] int GetProcessId(out uint pRetVal);
        [PreserveSig] int IsSystemSoundsSession();
        [PreserveSig] int SetDuckingPreference(bool optOut);
    }

    [Guid("87CE5498-68D6-44E5-9215-6DA47EF883D8"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    internal interface ISimpleAudioVolume {
        [PreserveSig] int SetMasterVolume(float fLevel, ref Guid EventContext);
        [PreserveSig] int GetMasterVolume(out float pfLevel);
        [PreserveSig] int SetMute(bool bMute, ref Guid EventContext);
        [PreserveSig] int GetMute(out bool pbMute);
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
                        keybd_event(VK_MEDIA_PLAY_PAUSE, 0, 0, UIntPtr.Zero);
                        keybd_event(VK_MEDIA_PLAY_PAUSE, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
                    }
                    Console.WriteLine("OK");
                    return 0;
                }

                var enumerator = (IMMDeviceEnumerator)(new MMDeviceEnumeratorComObject());
                IMMDeviceCollection devCol = null;
                // DEVICE_STATE_ACTIVE = 1
                enumerator.EnumAudioEndpoints(EDataFlow.eRender, 1, out devCol);

                int devCount = 0;
                if (devCol != null) {
                    devCol.GetCount(out devCount);
                }

                Guid IID_IAudioSessionManager2 = typeof(IAudioSessionManager2).GUID;
                Guid emptyGuid = Guid.Empty;

                if (command == "list") {
                    for (int d = 0; d < devCount; d++) {
                        IMMDevice dev = null;
                        devCol.Item(d, out dev);
                        if (dev == null) continue;

                        object obj = null;
                        dev.Activate(ref IID_IAudioSessionManager2, 0, IntPtr.Zero, out obj);
                        var mgr = obj as IAudioSessionManager2;
                        if (mgr == null) continue;

                        IAudioSessionEnumerator sessionEnum = null;
                        mgr.GetSessionEnumerator(out sessionEnum);
                        if (sessionEnum == null) continue;

                        int count = 0;
                        sessionEnum.GetCount(out count);
                        for (int i = 0; i < count; i++) {
                            IAudioSessionControl ctl = null;
                            sessionEnum.GetSession(i, out ctl);
                            var ctl2 = ctl as IAudioSessionControl2;
                            if (ctl2 != null) {
                                uint pid = 0;
                                ctl2.GetProcessId(out pid);
                                string pName = "";
                                if (pid > 0) {
                                    try {
                                        pName = Process.GetProcessById((int)pid).ProcessName;
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

                for (int d = 0; d < devCount; d++) {
                    IMMDevice dev = null;
                    devCol.Item(d, out dev);
                    if (dev == null) continue;

                    object obj = null;
                    dev.Activate(ref IID_IAudioSessionManager2, 0, IntPtr.Zero, out obj);
                    var mgr = obj as IAudioSessionManager2;
                    if (mgr == null) continue;

                    IAudioSessionEnumerator sessionEnum = null;
                    mgr.GetSessionEnumerator(out sessionEnum);
                    if (sessionEnum == null) continue;

                    int count = 0;
                    sessionEnum.GetCount(out count);
                    for (int i = 0; i < count; i++) {
                        IAudioSessionControl ctl = null;
                        sessionEnum.GetSession(i, out ctl);
                        var ctl2 = ctl as IAudioSessionControl2;
                        if (ctl2 != null) {
                            uint pid = 0;
                            ctl2.GetProcessId(out pid);
                            if (pid <= 0) continue;

                            string pName = "";
                            try {
                                pName = Process.GetProcessById((int)pid).ProcessName.ToLowerInvariant();
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
