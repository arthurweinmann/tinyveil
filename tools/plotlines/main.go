package main

import (
	"bytes"
	"flag"
	"fmt"
	"os"
	"os/exec"
	"strconv"
	"strings"

	"gonum.org/v1/plot"
	"gonum.org/v1/plot/plotter"
	"gonum.org/v1/plot/plotutil"
	"gonum.org/v1/plot/vg"
)

func main() {
	var folder string
	var fileExt string

	// Define flags with default values
	flag.StringVar(&folder, "folder", ".", "The folder path to consider")
	flag.StringVar(&fileExt, "ext", ".js", "The file extension to consider")

	// Parse the command line flags
	flag.Parse()

	// If the folder flag is not set, use the current working directory
	if folder == "." {
		var err error
		folder, err = os.Getwd()
		if err != nil {
			fmt.Println("Error getting current directory:", err)
			return
		}
	}

	cmd := exec.Command("git", "diff-index", "--quiet", "HEAD", "--")

	// Run the git command
	if err := cmd.Run(); err != nil {
		// If there's an error, there are uncommitted changes
		fmt.Println("Please commit all your changes before running this script")
		return
	}

	cmd = exec.Command("git", "branch", "--show-current")
	out := new(bytes.Buffer)
	cmd.Stdout = out
	err := cmd.Run()
	if err != nil {
		fmt.Println("Error executing git command:", err, out.String())
		return
	}

	// Get the branch name and remove any newlines
	branchName := strings.TrimSpace(out.String())

	fmt.Println("Current branch name:", branchName)

	// Get the list of commit hashes.
	cmd = exec.Command("git", "rev-list", "--all")
	out = new(bytes.Buffer)
	cmd.Stdout = out
	err = cmd.Run()
	if err != nil {
		fmt.Printf("Error running git rev-list command %v - %v\n", err, out.String())
		return
	}
	commits := strings.Split(out.String(), "\n")

	// Prepare a slice to hold the line counts.
	type commitData struct {
		Hash  string
		Lines int
	}
	var data []commitData

	// Iterate over the commits.
	for i := len(commits) - 1; i > -1; i-- {
		commit := commits[i]
		if commit == "" {
			continue
		}
		// Check out the commit.
		checkoutCmd := exec.Command("git", "checkout", commit)
		out, err := checkoutCmd.CombinedOutput()
		if err != nil {
			fmt.Printf("Error checking out commit %s: %v - %v\n", commit, err, string(out))
			return
		}

		// Count the lines of .js files.
		findCmdString := fmt.Sprintf("find %s -name '*%s' | xargs wc -l | sort -nr", folder, fileExt)
		findCmd := exec.Command("bash", "-c", findCmdString)
		var findOut bytes.Buffer
		findCmd.Stdout = &findOut
		err = findCmd.Run()
		if err != nil {
			fmt.Printf("Error running find command on commit %s: %v\n", commit, err)
			return
		}

		// Split the output into lines
		lines := strings.Split(findOut.String(), "\n")

		// The total should be in the first line of the output
		// Trim spaces and split by spaces to isolate the number
		totalLine := strings.Fields(lines[0])
		if len(totalLine) < 2 {
			fmt.Println("Could not parse the total line")
			return
		}

		// Convert the total string to an integer
		totalLines, err := strconv.Atoi(totalLine[0])
		if err != nil {
			fmt.Println("Error converting total to integer:", err)
			return
		}

		// Store the data.
		data = append(data, commitData{Hash: commit, Lines: totalLines})
	}

	// Plot the data.
	p := plot.New()
	p.Title.Text = fmt.Sprintf("Lines of %s Code Over Time in directory %s", fileExt, folder)
	p.X.Label.Text = "Time"
	p.Y.Label.Text = "Lines of Code"

	pts := make(plotter.XYs, len(data))
	for i, d := range data {
		pts[i].X = float64(i) // This could be improved by converting commit dates to a float64.
		pts[i].Y = float64(d.Lines)
	}

	err = plotutil.AddLinePoints(p, "Lines", pts)
	if err != nil {
		panic(err)
	}

	// Save the plot to a PNG file.
	if err := p.Save(10*vg.Inch, 4*vg.Inch, "lines_of_code_over_commit_time.png"); err != nil {
		panic(err)
	}

	fmt.Println("Plot saved to lines_of_code_over_commit_time.png")

	// Check out the original branch.
	output, err := exec.Command("git", "checkout", branchName).CombinedOutput()
	if err != nil {
		fmt.Printf("Error checking out branch: %s\n", err)
		fmt.Printf("Git output:\n%s", string(output))
		fmt.Printf("Please run command `git checkout %s` manually\n", branchName)
		return
	}
}
