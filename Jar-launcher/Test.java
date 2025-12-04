public class Test {
    public static void main(String[] args) {
        System.out.println("Hello from Test JAR!");
        System.out.println("This is a test JAR file for JAR Launcher.");
        System.out.println("Command line arguments: ");
        for (int i = 0; i < args.length; i++) {
            System.out.println("  " + (i+1) + ": " + args[i]);
        }
        System.out.println("\nPress Enter to exit...");
        try {
            System.in.read();
        } catch (Exception e) {
            e.printStackTrace();
        }
        System.out.println("Exiting...");
    }
}