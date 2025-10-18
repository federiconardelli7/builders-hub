import { ReactNode, Children, cloneElement, isValidElement } from "react";

interface ProgressStepsProps {
  currentStep: number;
  completedSteps: number[];
  children: ReactNode;
}

interface ProgressStepProps {
  stepNumber: number;
  children: ReactNode;
  // Internal props injected by ProgressSteps
  _status?: 'completed' | 'active' | 'pending';
}

export function ProgressSteps({ currentStep, completedSteps, children }: ProgressStepsProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Progress Steps - Custom styling that extends fumadocs-ui Steps */
          .progress-steps {
            border-left-color: rgb(228 228 231); /* zinc-300 */
          }

          .dark .progress-steps {
            border-left-color: rgb(63 63 70); /* zinc-700 */
          }

          /* Override the default circle styling based on status */
          .progress-steps .fd-step[data-status="completed"]::before {
            background-color: rgb(34 197 94); /* green-500 */
            color: white;
            content: "✓";
            font-weight: 600;
            font-size: 1rem;
          }

          .progress-steps .fd-step[data-status="active"]::before {
            background-color: rgb(59 130 246); /* blue-500 */
            color: white;
            font-weight: 700;
          }

          .progress-steps .fd-step[data-status="pending"]::before {
            background-color: rgb(244 244 245); /* zinc-100 */
            border: 2px solid rgb(212 212 216); /* zinc-300 */
            color: rgb(161 161 170); /* zinc-400 */
            font-weight: 500;
          }

          .dark .progress-steps .fd-step[data-status="pending"]::before {
            background-color: rgb(39 39 42); /* zinc-800 */
            border-color: rgb(63 63 70); /* zinc-700 */
            color: rgb(113 113 122); /* zinc-500 */
          }

          /* Change border color for completed sections */
          .progress-steps .fd-step[data-status="completed"] {
            border-left-color: rgb(34 197 94); /* green-500 */
          }

          /* Add spacing for better visual hierarchy */
          .progress-steps .fd-step {
            padding-bottom: 2rem;
          }

          .progress-steps .fd-step:last-child {
            padding-bottom: 0;
          }
        `
      }} />
      <div className="fd-steps progress-steps">
        {Children.map(children, (child, index) => {
          if (!isValidElement<ProgressStepProps>(child)) return child;

          const stepNumber = child.props.stepNumber || index + 1;
          const isCompleted = completedSteps.includes(stepNumber);
          const isCurrent = currentStep === stepNumber;

          let status: 'completed' | 'active' | 'pending' = 'pending';
          if (isCompleted) status = 'completed';
          else if (isCurrent) status = 'active';

          return cloneElement(child, {
            _status: status,
          });
        })}
      </div>
    </>
  );
}

export function ProgressStep({ children, _status = 'pending' }: ProgressStepProps) {
  return (
    <div className="fd-step" data-status={_status}>
      {children}
    </div>
  );
}
