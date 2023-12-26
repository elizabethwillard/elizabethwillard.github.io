---
layout: post
title: Learning about C#
categories: Technical
date: 2023-12-21

---
I've had to work on some C# features for work lately, so I wanted to take some time to write down some of the weird things that I've learned. C# allows you to develop an application to be run in .NET. 

![image](https://github.com/elizabethwillard/elizabethwillard.github.io/assets/57194659/9098c0c0-aca4-443f-9392-e6bc5cbdcc57)
I've got a mild case of Python brain-rot that made it really difficult to wrap my head around the types in C#. But, once we've got a Program.cs file going, we can create a variety of `public static` functions to handle command-line arguments. This is based off of the "task-based asynchronous pattern" that's explained in further detail [here](https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap). 

```markdown
├── program.cs
├── inputs.cs
├── service.cs
```

Let's go through these one-by-one.

### Inputs

This file we can use to define an interface and a class for the file input that we want. For me, I want to use a CSV file to parse inputs from in order to access a bucket on S3. 

```cs
﻿namespace FileDownload;

public class FileInput
{
    public string InputCSV
    {
        get;
        set;
    }
}
```

If we run this program 
`dotnet run FileDownload Example.csv`
The "Example.csv" portion of this string will be captured with this class declaration, which we can then use in the next file we want, service.cs

### Service
```cs
namespace FileDownload;
public class FileService 
{
	private readonly FileInput _input;
	public FileService(FileInput input)
	{
		_input = input;
	}

	public async Task StartAsync()
	{
		if (!File.Exists(_input.InputCSV))        
		{
            await _consoleWriter.WriteLine("Please pass a CSV file.");
            return;
        }
	}
	public Task StopAsync()
	{
		return Task.CompletedTask;
	}
}
```

So, now we can do something with the new FileInput class and define the logic around what we want to do with the command-line argument. 

### Program

Finally, this brings us back to the Program.cs file and our `public static async Task Main(string[] args)` function. 

We want to define a couple things within this main function, in accordance to the task-based pattern. 
1. An object that utilizes a function for the program inputs
2. Another object that utilizes a function that "builds" the program 
3. A call to StartAsync within FileService 


```cs
    public static async Task Main(string[] args)
    {
        var settings = CreateApplicationSettings(args, null, null);
        var builder = CreateHostApplicationBuilder(settings);
        var host = builder.Build();
        await host.StartAsync();
    }


    public static HostApplicationBuilderSettings CreateApplicationSettings(string[] args)
    {
        // This allows for faster start up, but you needs to setup more things.
        var settings = new HostApplicationBuilderSettings
        {
            DisableDefaults = true,
            Args = args,
            ApplicationName = ApplicationName
        };
        return settings;
    }

public static HostApplicationBuilder CreateHostApplicationBuilder(HostApplicationBuilderSettings settings)
    {
        var builder = Host.CreateApplicationBuilder(settings);
        var applicationInputs = CreateApplicationInputs(settings.Args);
        
        builder.Services.AddLogging();
        
        builder.Configuration.AddEnvironmentVariables();

        builder.Services.AddSingleton(applicationInputs);

        
       
        builder.Services.AddHostedService<FileService>();
       
        return builder;
    }

    private static FileDownloaderInput CreateApplicationInputs(string[]? args)
    {

        var fileArgument = new Argument<string>("file", "CSV Input File");
       
        var inputs = new FileInput();
        
        return inputs;
    }
```
