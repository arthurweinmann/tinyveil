package main

import (
	"bytes"
	"fmt"
	"os/exec"
	"strconv"
	"strings"

	"gonum.org/v1/plot"
	"gonum.org/v1/plot/plotter"
	"gonum.org/v1/plot/plotutil"
	"gonum.org/v1/plot/vg"
)

func main() {
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
		panic(err)
	}
	commits := strings.Split(out.String(), "\n")

	// Prepare a slice to hold the line counts.
	type commitData struct {
		Hash  string
		Lines int
	}
	var data []commitData

	// Iterate over the commits.
	for _, commit := range commits {
		if commit == "" {
			continue
		}
		// Check out the commit.
		checkoutCmd := exec.Command("git", "checkout", commit)
		out, err := checkoutCmd.CombinedOutput()
		if err != nil {
			fmt.Printf("Error checking out commit %s: %v - %v\n", commit, err, string(out))
			continue
		}

		// Count the lines of .js files.
		findCmdString := "find web/ -name '*.js' | xargs wc -l | sort -nr"
		findCmd := exec.Command("bash", "-c", findCmdString)
		var findOut bytes.Buffer
		findCmd.Stdout = &findOut
		err = findCmd.Run()
		if err != nil {
			fmt.Printf("Error running find command on commit %s: %v\n", commit, err)
			continue
		}

		// Parse the output to get the total line count.
		linesOutput := strings.Split(findOut.String(), "\n")
		totalLinesStr := strings.Fields(linesOutput[len(linesOutput)-2])[0]
		totalLines, err := strconv.Atoi(totalLinesStr)
		if err != nil {
			fmt.Printf("Error parsing line count on commit %s: %v\n", commit, err)
			continue
		}

		// Store the data.
		data = append(data, commitData{Hash: commit, Lines: totalLines})
	}

	// Plot the data.
	p := plot.New()
	p.Title.Text = "Lines of JavaScript Code Over Time"
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
	if err := p.Save(10*vg.Inch, 4*vg.Inch, "loc_over_time.png"); err != nil {
		panic(err)
	}

	fmt.Println("Plot saved to loc_over_time.png")

	// Check out the original branch.
	output, err := exec.Command("git", "checkout", branchName).CombinedOutput()
	if err != nil {
		fmt.Printf("Error checking out branch: %s\n", err)
		fmt.Printf("Git output:\n%s", string(output))
		fmt.Printf("Please run command `git checkout %s` manually\n", branchName)
		return
	}
}
