package com.saket.cnbank.Utils;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

public class Diff {
    // Diff operation constants
    public static final int DELETE = -1;
    public static final int INSERT = 1;
    public static final int EQUAL = 0;

    // Regex patterns
    private static final Pattern nonAlphaNumericRegex = Pattern.compile("[^a-zA-Z0-9]");
    private static final Pattern whitespaceRegex = Pattern.compile("\\s");
    private static final Pattern linebreakRegex = Pattern.compile("[\\r\\n]");
    private static final Pattern blanklineEndRegex = Pattern.compile("\\n\\r?\\n$");
    private static final Pattern blanklineStartRegex = Pattern.compile("^\\r?\\n\\r?\\n");

    /**
     * Class representing a diff operation and its associated text.
     */
    public static class Tuple {
        public final int operation;
        public final String text;

        public Tuple(int operation, String text) {
            this.operation = operation;
            this.text = text;
        }
    }

    /**
     * Find the differences between two texts.
     * @param text1 Old string to be diffed
     * @param text2 New string to be diffed
     * @param cursorPos Edit position in text1 or null
     * @param cleanup Whether to apply semantic cleanup
     * @return List of diff tuples
     */
    public static List<Tuple> diff(String text1, String text2, Integer cursorPos, boolean cleanup) {
        return diffMain(text1, text2, cursorPos, cleanup, true);
    }

    private static List<Tuple> diffMain(String text1, String text2, Integer cursorPos, 
                                      boolean cleanup, boolean fixUnicode) {
        // Check for equality
        if (text1.equals(text2)) {
            List<Tuple> diffs = new ArrayList<>();
            if (!text1.isEmpty()) {
                diffs.add(new Tuple(EQUAL, text1));
            }
            return diffs;
        }

        // Trim off common prefix and suffix
        int commonLength = diffCommonPrefix(text1, text2);
        String commonPrefix = text1.substring(0, commonLength);
        text1 = text1.substring(commonLength);
        text2 = text2.substring(commonLength);

        commonLength = diffCommonSuffix(text1, text2);
        String commonSuffix = text1.substring(text1.length() - commonLength);
        text1 = text1.substring(0, text1.length() - commonLength);
        text2 = text2.substring(0, text2.length() - commonLength);

        // Compute the diff on the middle block
        List<Tuple> diffs = diffCompute(text1, text2, cleanup);

        // Restore the prefix and suffix
        if (!commonPrefix.isEmpty()) {
            diffs.add(0, new Tuple(EQUAL, commonPrefix));
        }
        if (!commonSuffix.isEmpty()) {
            diffs.add(new Tuple(EQUAL, commonSuffix));
        }

        diffCleanupMerge(diffs, fixUnicode);
        if (cleanup) {
            diffCleanupSemantic(diffs);
        }

        return diffs;
    }

    /**
     * Find the differences between two texts, assuming no common prefix or suffix.
     */
    private static List<Tuple> diffCompute(String text1, String text2, boolean cleanup) {
        List<Tuple> diffs = new ArrayList<>();

        if (text1.isEmpty()) {
            // Just add some text (speedup)
            diffs.add(new Tuple(INSERT, text2));
            return diffs;
        }

        if (text2.isEmpty()) {
            // Just delete some text (speedup)
            diffs.add(new Tuple(DELETE, text1));
            return diffs;
        }

        String longtext = text1.length() > text2.length() ? text1 : text2;
        String shorttext = text1.length() > text2.length() ? text2 : text1;
        int i = longtext.indexOf(shorttext);

        if (i != -1) {
            // Shorter text is inside the longer text (speedup)
            int operation = (text1.length() > text2.length()) ? DELETE : INSERT;
            diffs.add(new Tuple(operation, longtext.substring(0, i)));
            diffs.add(new Tuple(EQUAL, shorttext));
            diffs.add(new Tuple(operation, longtext.substring(i + shorttext.length())));
            return diffs;
        }

        if (shorttext.length() == 1) {
            // Single character string
            diffs.add(new Tuple(DELETE, text1));
            diffs.add(new Tuple(INSERT, text2));
            return diffs;
        }

        // Check for half match
        String[] hm = diffHalfMatch(text1, text2);
        if (hm != null) {
            // A half-match was found, sort out the return data
            String text1A = hm[0];
            String text1B = hm[1];
            String text2A = hm[2];
            String text2B = hm[3];
            String midCommon = hm[4];
            
            // Send both pairs off for separate processing
            List<Tuple> diffsA = diffMain(text1A, text2A, null, cleanup, false);
            List<Tuple> diffsB = diffMain(text1B, text2B, null, cleanup, false);
            
            // Merge the results
            diffs.addAll(diffsA);
            diffs.add(new Tuple(EQUAL, midCommon));
            diffs.addAll(diffsB);
            return diffs;
        }

        return diffBisect(text1, text2);
    }

    /**
     * Find the 'middle snake' of a diff using the Myers algorithm.
     */
    private static List<Tuple> diffBisect(String text1, String text2) {
        int text1Length = text1.length();
        int text2Length = text2.length();
        int maxD = (text1Length + text2Length + 1) / 2;
        int vOffset = maxD;
        int vLength = 2 * maxD;
        int[] v1 = new int[vLength];
        int[] v2 = new int[vLength];
        
        // Initialize arrays
        for (int x = 0; x < vLength; x++) {
            v1[x] = -1;
            v2[x] = -1;
        }
        v1[vOffset + 1] = 0;
        v2[vOffset + 1] = 0;
        
        int delta = text1Length - text2Length;
        boolean front = (delta % 2 != 0);
        
        int k1start = 0;
        int k1end = 0;
        int k2start = 0;
        int k2end = 0;
        
        for (int d = 0; d < maxD; d++) {
            for (int k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
                int k1Offset = vOffset + k1;
                int x1;
                if (k1 == -d || (k1 != d && v1[k1Offset - 1] < v1[k1Offset + 1])) {
                    x1 = v1[k1Offset + 1];
                } else {
                    x1 = v1[k1Offset - 1] + 1;
                }
                
                int y1 = x1 - k1;
                while (x1 < text1Length && y1 < text2Length 
                       && text1.charAt(x1) == text2.charAt(y1)) {
                    x1++;
                    y1++;
                }
                
                v1[k1Offset] = x1;
                if (x1 > text1Length) {
                    k1end += 2;
                } else if (y1 > text2Length) {
                    k1start += 2;
                } else if (front) {
                    int k2Offset = vOffset + delta - k1;
                    if (k2Offset >= 0 && k2Offset < vLength && v2[k2Offset] != -1) {
                        int x2 = text1Length - v2[k2Offset];
                        if (x1 >= x2) {
                            return diffBisectSplit(text1, text2, x1, y1);
                        }
                    }
                }
            }

            // Walk the reverse path one step
            for (int k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
                int k2Offset = vOffset + k2;
                int x2;
                if (k2 == -d || (k2 != d && v2[k2Offset - 1] < v2[k2Offset + 1])) {
                    x2 = v2[k2Offset + 1];
                } else {
                    x2 = v2[k2Offset - 1] + 1;
                }
                
                int y2 = x2 - k2;
                while (x2 < text1Length && y2 < text2Length && 
                       text1.charAt(text1Length - x2 - 1) == 
                       text2.charAt(text2Length - y2 - 1)) {
                    x2++;
                    y2++;
                }
                
                v2[k2Offset] = x2;
                if (x2 > text1Length) {
                    k2end += 2;
                } else if (y2 > text2Length) {
                    k2start += 2;
                } else if (!front) {
                    int k1Offset = vOffset + delta - k2;
                    if (k1Offset >= 0 && k1Offset < vLength && v1[k1Offset] != -1) {
                        int x1 = v1[k1Offset];
                        int y1 = vOffset + x1 - k1Offset;
                        x2 = text1Length - x2;
                        if (x1 >= x2) {
                            return diffBisectSplit(text1, text2, x1, y1);
                        }
                    }
                }
            }
        }
        
        // Diff took too long or no commonality; do a linear diff
        List<Tuple> diffs = new ArrayList<>();
        diffs.add(new Tuple(DELETE, text1));
        diffs.add(new Tuple(INSERT, text2));
        return diffs;
    }

    /**
     * Split two texts into an array of strings.
     */
    private static List<Tuple> diffBisectSplit(String text1, String text2, 
                                              int x, int y) {
        String text1a = text1.substring(0, x);
        String text2a = text2.substring(0, y);
        String text1b = text1.substring(x);
        String text2b = text2.substring(y);

        List<Tuple> diffs = diffMain(text1a, text2a, null, false, false);
        List<Tuple> diffsb = diffMain(text1b, text2b, null, false, false);
        diffs.addAll(diffsb);
        return diffs;
    }

    // Helper methods for cleanup operations omitted for brevity
    // Include diffCleanupSemantic, diffCleanupMerge, etc.
    
    /**
     * Determine the common prefix length of two strings.
     */
    private static int diffCommonPrefix(String text1, String text2) {
        int n = Math.min(text1.length(), text2.length());
        for (int i = 0; i < n; i++) {
            if (text1.charAt(i) != text2.charAt(i)) {
                return i;
            }
        }
        return n;
    }

    /**
     * Determine the common suffix length of two strings.
     */
    private static int diffCommonSuffix(String text1, String text2) {
        int text1Length = text1.length();
        int text2Length = text2.length();
        int n = Math.min(text1Length, text2Length);
        for (int i = 1; i <= n; i++) {
            if (text1.charAt(text1Length - i) != text2.charAt(text2Length - i)) {
                return i - 1;
            }
        }
        return n;
    }

    /**
     * Cleanup a list of diffs by merging adjacent entries.
     */
    private static void diffCleanupMerge(List<Tuple> diffs, boolean fixUnicode) {
        if (diffs.isEmpty()) return;
        
        // Add a dummy entry at the end
        diffs.add(new Tuple(EQUAL, ""));
        
        int pointer = 0;
        int count_delete = 0;
        int count_insert = 0;
        String text_delete = "";
        String text_insert = "";
        
        while (pointer < diffs.size()) {
            switch (diffs.get(pointer).operation) {
                case DELETE:
                    count_delete++;
                    text_delete += diffs.get(pointer).text;
                    break;
                case INSERT:
                    count_insert++;
                    text_insert += diffs.get(pointer).text;
                    break;
                case EQUAL:
                    // Upon reaching an equality, check if there are diffs to merge
                    if (count_delete + count_insert > 0) {
                        if (count_delete != 0 && count_insert != 0) {
                            // Factor out any common prefix
                            int commonlength = diffCommonPrefix(text_insert, text_delete);
                            if (commonlength != 0) {
                                if (pointer - count_delete - count_insert > 0 &&
                                    diffs.get(pointer - count_delete - count_insert - 1).operation == EQUAL) {
                                    String newText = diffs.get(pointer - count_delete - count_insert - 1).text + 
                                                   text_insert.substring(0, commonlength);
                                    diffs.set(pointer - count_delete - count_insert - 1, 
                                            new Tuple(EQUAL, newText));
                                } else {
                                    diffs.add(0, new Tuple(EQUAL, text_insert.substring(0, commonlength)));
                                    pointer++;
                                }
                                text_insert = text_insert.substring(commonlength);
                                text_delete = text_delete.substring(commonlength);
                            }
                            // Factor out any common suffix
                            commonlength = diffCommonSuffix(text_insert, text_delete);
                            if (commonlength != 0) {
                                String newText = text_insert.substring(text_insert.length() - commonlength) + 
                                               diffs.get(pointer).text;
                                diffs.set(pointer, new Tuple(EQUAL, newText));
                                text_insert = text_insert.substring(0, text_insert.length() - commonlength);
                                text_delete = text_delete.substring(0, text_delete.length() - commonlength);
                            }
                        }
                        // Delete the offending records and add the merged ones
                        pointer -= count_delete + count_insert;
                        for (int j = 0; j < count_delete + count_insert; j++) {
                            diffs.remove(pointer);
                        }
                        if (!text_delete.isEmpty()) {
                            diffs.add(pointer++, new Tuple(DELETE, text_delete));
                        }
                        if (!text_insert.isEmpty()) {
                            diffs.add(pointer++, new Tuple(INSERT, text_insert));
                        }
                    }
                    count_insert = 0;
                    count_delete = 0;
                    text_delete = "";
                    text_insert = "";
                    break;
            }
            pointer++;
        }
        // Remove the dummy entry at the end
        if (diffs.get(diffs.size() - 1).text.isEmpty()) {
            diffs.remove(diffs.size() - 1);
        }
    }

    /**
     * Reduce the number of edits by eliminating semantically trivial equalities.
     */
    private static void diffCleanupSemantic(List<Tuple> diffs) {
        if (diffs.isEmpty()) return;
        
        boolean changes = false;
        int[] equalities = new int[diffs.size()];  // Stack of indices where equalities are found
        int equalitiesLength = 0;  // Length of equalities stack
        String lastEquality = null;  // Changed from Integer to String
        int pointer = 0;  // Index of current position

        while (pointer < diffs.size()) {
            if (diffs.get(pointer).operation == EQUAL) {
                equalities[equalitiesLength++] = pointer;
                lastEquality = diffs.get(pointer).text;
                pointer++;
            } else {
                equalitiesLength = 0;
                pointer++;
            }
        }
    }

    /**
     * Check if the two texts share a substring which is at least half the length of the longer text.
     */
    private static String[] diffHalfMatch(String text1, String text2) {
        int longTextLength = Math.max(text1.length(), text2.length());
        if (longTextLength < 10) {
            return null;  // Don't bother with small strings
        }

        String shortText = text1.length() > text2.length() ? text2 : text1;
        String longText = text1.length() > text2.length() ? text1 : text2;
        
        int mid = longTextLength / 4;
        String seed = shortText.substring(mid, mid + longTextLength/4);
        int pos = longText.indexOf(seed);
        
        if (pos == -1) {
            return null;
        }
        
        return new String[] {
            text1.substring(0, mid),
            text1.substring(mid),
            text2.substring(0, pos),
            text2.substring(pos + seed.length()),
            seed
        };
    }
}
